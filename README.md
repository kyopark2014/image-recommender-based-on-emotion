# Amazon Rekognition과 Personalize를 이용한 감성 이미지 추천하기

카메라로 사람의 표정을 분석하여 현재의 감성(Emotion)을 얻을 수 있다면, 개인화된 추천 시스템에서 유용하게 활용할 수 있습니다. 여기서는 [Amazon Rekognition](https://aws.amazon.com/ko/rekognition/)을 이용하여 사용자의 감성을 얻고, 사용자의 감성을 잘 표현하는 이미지를 [Amazon Personlize](https://aws.amazon.com/ko/personalize/)를 이용하여 추천합니다. 이를 통해 Amazon의 완전관리형 서비스인 Rekognition과 Personalize를 효과적으로 사용하는 방법을 이해할 수 있습니다. 또한 감성을 표현하는 이미지는 [Amazon SageMaker JumpStart](https://docs.aws.amazon.com/sagemaker/latest/dg/studio-jumpstart.html)의 [Stable Diffusion 모델](https://aws.amazon.com/ko/blogs/tech/ai-art-stable-diffusion-sagemaker-jumpstart/)을 이용해 생성합니다. Stable Diffision 모델은 텍스트로 이미지를 생성하는 기초 모델 (Foundation Model)으로서, SageMaker JumpStart를 이용하면 생성 AI로 감성을 나타내는 이미지들을 쉽게 생성할 수 있습니다. 

개인화 추천의 경우에 사용자의 이전 상호작용(interaction)을 이용하여 추천을 수행하게 되는데, 이전 히스토리가 없는 경우에는 감정(emotion)에 맞는 적절한 추천을 할 수 없습니다. 따라서, 여기에서는 이전 히스토리가 없는 경우에는 감성 정보를 바탕으로 미리 학습한 데이터를 이용하여 "감성 추천"을 수행하고, 일정 데이터가 확보되었을 때에 "개인화 추천"을 수행하는 방법을 이용합니다. 아래는 사용자의 감정에 따라 이미지를 추천하는 시스템 아키텍처를 보여주고 있습니다.

## 감성 이미지 추천 아키텍처

아래와 같이 전체적인 아키텍처(Archtiecture)는 시스템 관리자(administrator)가 이미지를 생성하고 사용자(user)에게 감성 기반의 이미지 추천을 하는 인프라로 구성됩니다. 감성 이미지 생성에 필요한 인프라인 SageMaker Endpoint는 GPU를 가진 EC2로 구성되므로 다수의 이미지를 일정 시간동안 생성하는것이 비용면에서 효율적입니다. 이를 위해서 [Event driven 방식](https://aws.amazon.com/ko/event-driven-architecture/)으로 [FIFO 형태의 Amazon SQS](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/FIFO-queues.html)를 사용하여 이미지를 생성하며, 생성된 이미지는 상용 폴더가 아닌 이미지풀(image pool)에 우선 저장됩니다. 시스템 관리자에 의해 이미지풀에 저장된 이미지가 적절하게 감성을 표현했는지 확인하고, 상용 폴더인 emotions로 이동합니다. 상용 폴더에 이미지가 들어오면 마찬가지로 FiFO 형태의 SQS와 Lambda를 통해 순차적으로 아이템 데이터셋을 생성합니다. 이후 사용자가 카메라를 이용해 화면을 캡춰하면, Amazon CloudFront / API Gateway를 통해 이미지가 인입되고 Lambda를 통해 Rekognition에서 이미지 분석이 이루어집니다. 이후 사용자가 감성에 따른 이미지 추천을 요청하면 Lambda를 통해 Personalize에서 추천 추론(inference)이 이루어집니다. 추천 추론의 결과는 이미지 리스트로서 사용자에게 전달되어 보여집니다. 사용자는 자신의 감정에 맞는 이미지를 선택하여 선호(like)를 표시할 수 있으며, 이때 생성된 상호활동(interaction) 이벤트를 상호활동 데이터셋으로 저장하여 추후 추천 추론(inferece)을 향상시키기 위해 사용합니다.

![image](https://user-images.githubusercontent.com/52392004/236751976-5a31399b-7a49-4c10-a0ed-e7e80e042252.png)

전체적인 신호 흐름도(signal flow)는 아래를 참조합니다.

1) 시스템 관리자(administrator)는 감성(emotion)에 맞게 생성된 이미지를 /imgPool에서 /emotion으로 이동합니다. 이때 생성된 이미지는 Stable Diffusion 모델을 생성된 가상의 이미지입니다. 이때 이미 감성을 잘 표현하는 이미지가 있다면, Amazon S3의 버켓(Bucket)에 동일한 방식으로 복사합니다.
2) 복사된 이미지의 [S3 put event](https://docs.aws.amazon.com/ko_kr/AmazonS3/latest/userguide/NotificationHowTo.html)를 이용하여 [aws lambda](https://aws.amazon.com/ko/lambda/)가 실행되면서 personalize에 putItem으로 아이템 데이터셋을 생성합니다.
3) 사용자가 카메라 앞에 있을때에 [Personalize의 detectFaces](https://docs.aws.amazon.com/rekognition/latest/APIReference/API_DetectFaces.html)를 이용해서 감성(emotion)을 분석합니다. 이후 [Personalize의 searchFaces](https://docs.aws.amazon.com/rekognition/latest/APIReference/API_SearchFaces.html)을 이용하여 사용자 아이디(userId)를 확인합니다. 만약 얼굴 분석 결과를 저장하는 [Personalize의 Correction](https://docs.aws.amazon.com/rekognition/latest/dg/collections.html)에 등록되지 않은 얼굴(Face) 이미지가 있을 경우에는 새로운 사용자 아이디(userId)로 생성합니다.
4) 사용자 아이디(userId)를 이용하여 [Personalize의 getRecommendations](https://docs.aws.amazon.com/ko_kr/personalize/latest/dg/API_RS_GetRecommendations.html)을 이용하여 "감성 추천" 및 "개인화 추천"을 이용합니다. 
5) 사용자가 감성 이미지를 선택하는 경우에 상호작용(interaction)을 [Personalize의 putEvents](https://docs.aws.amazon.com/personalize/latest/dg/API_UBS_PutEvents.html)을 이용하여 저장하여, 상호작용 데이터셋을 생성합니다. 

![sequence](https://user-images.githubusercontent.com/52392004/236651082-31086a0a-cf6f-4751-b44f-79a70430f95c.png)


## 시스템 구현하기

### 감성(emotion) 확인

[감정 분석](./face-search.md)에서는 [Rekognition의 detectFaces](https://docs.aws.amazon.com/rekognition/latest/APIReference/API_DetectFaces.html)를 이용하여 사용자의 감성 및 성별을 확인하는 방법에 대해 설명합니다.

### 사용자(userId) 확인

[사용자 분석](./face-correction.md)에서는 [Rekognition의 SearchFacesByImageRequest](https://docs.aws.amazon.com/rekognition/latest/dg/search-face-with-image-procedure.html)를 이용하여 사용자의 아이디를 확인합니다.

### 사용자 정보 수집

[사용자 정보 분석](./personalize-user.md)에서는 Personalize에서 사용되는 사용자의 정보의 Schema와 수집방법에 대해 설명합니다.


### 아이템 정보 수집

[Item 정보 수집](./personalize-item.md)에서는 Personalize에서 사용되는 아이템 정보의 Schema와 수집방법에 대해 설명합니다.


### 상호작용 정보 수집

[Interaction 정보 수집](./personalize-interaction.md)에서는 Personalize에서 사용되는 상호작용 정보의 Schema와 수집방법에 대해 설명합니다.


### 추천 Inference 구현

[추천 추론](./recommendation.md)에서는 Personalize로 부터 추론(inference) 요청하는것에 대해 설명합니다. 이때 "감정 추천"의 경우에는 미리 감정에 따라 추천을 수행하고, "개인화 추천"은 "감정 추천"을 통해 사용자의 상호작용 데이터가 충분히 확보되면 "개인화 추천"을 수행할 수 있습니다. 



## 직접 실습해 보기

### SageMaker JumpStart로 Stable Diffusion 설치

[Stable Diffusion 인프라 설치](./stable-diffusion-deployment.md)를 참조하여 Stable Diffusion을 위한 SageMaker Endpoint를 생성합니다. 

### Cloud9로 인프라 설치

[Cloud9로 인프라 설치](./deployment.md)을 참조하여 인프라를 설치합니다.

### 이미지 생성

[이미지 생성하기](https://github.com/kyopark2014/image-recommender-based-on-emotion/blob/main/image-generation.md)를 따라서 8개 감정에 대한 이미지를 생성합니다. 

### Personalize 학습

[Personalize 학습](https://github.com/kyopark2014/image-recommender-based-on-emotion/blob/main/personalize-training.md)에서는 추천을 위해 Personlize 환경을 준비하는 과정을 설명합니다.

### 실행하기
