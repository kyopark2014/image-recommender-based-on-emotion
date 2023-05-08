# 감성 이미지 추천

카메라로 사람의 표정을 분석하여 현재의 감성(Emotion)을 얻을 수 있다면, 추천 시스템에 유용하게 활용할 수 있습니다. 여기서는 [Amazon Rekognition](https://aws.amazon.com/ko/rekognition/)을 이용하여 사용자의 감성을 얻고, 사용자의 감성을 잘 표현하는 이미지를 [Amazon Personlize](https://aws.amazon.com/ko/personalize/)를 이용하여 추천합니다. 이를 통해 Amazon의 완전관리형 서비스인 Rekognition과 Personalize를 효과적으로 사용하는 방법을 이해할 수 있습니다. 또한 감성을 표현하는 이미지는 [Amazon SageMaker JumpStart](https://docs.aws.amazon.com/sagemaker/latest/dg/studio-jumpstart.html)의 [Stable Diffusion 모델](https://aws.amazon.com/ko/blogs/tech/ai-art-stable-diffusion-sagemaker-jumpstart/)을 이용해 생성합니다. Stable Diffision 모델은 텍스트로 이미지를 생성하는 기초 모델 (Foundation Model)으로서, SageMaker JumpStart를 이용하면 이미지를 생성하는 Endpoint를 쉽게 생성할 수 있습니다. 

개인화 추천의 경우에 사용자의 이전 상호작용(interaction)을 이용하여 추천을 수행하게 되는데, 이전 히스토리가 없는 경우에는 감정(emotion)에 맞는 적절한 추천을 할 수 없습니다. 따라서 본 여기에서는 이전 히스토리가 없는 경우에는 감성 정보를 바탕으로 미리 학습한 데이터를 이용하여 "감성 추천"을 수행하고, 일정 데이터가 확보되었을때에 "개인화 추천"을 수행하는 방법을 설명합니다. 아래는 사용자의 감정에 따라 이미지를 추천하는 시스템 아키텍처를 소개합니다. 

전체적인 아키텍처(Archtiecture)는 시스템 관리자(administrator)와 사용자(user)가 사용하는 인프라로 구분됩니다. 상단은 사용자가 감정을 표현하는 이미지를 Servirng하는 인프라이며 하단은 시스템 관리자가 감정을 표현하는 이미지를 생성하는 인프라입니다. 감성 이미지 생성시 StageMaker Endpoint를 사용하는데 GPU를 가진 EC2를 사용하므로 이미지를 일정 시간동안 다수 생성하는것이 효율적으로 비용을 최적화 하는 방법입니다. 이를 위해서 Event driven 방식으로 FIFO 형태의 SQS를 사용하여 이미지를 생성하며, 생성된 이미지는 상용 폴더가 아닌 이미지풀(image pool)에 우선 저장됩니다. 저장된 이미지중가 적절하게 감성을 표현했는지 확인하는 절차를 통해 이미지를 선별하고 선별된 이미지를 이미지풀에서 상용폴더인 /emotions로 이동합니다. 상용 폴더에 이미지가 들어오면 FiFO 형태의 SQS와 Lambda를 통해 순차적으로 Personalize에 아이템 데이터셋을 생성합니다. 사용자가 카메라를 이용하면 캡춰된 이미지는 Amazon CloudFront / API Gateway를 통해 인입되고 Lambda를 통해 Rekognition에서 이미지 분석이 이루어집니다. 이후 사용자가 감성에 따른 이미지 분석을 요청하면 Lambda를 통해 Personalize로 추론(inference)이루어 지고 이때 얻어진 이미지 리스트를 사용자에게 보여주게 됩니다. 사용자는 자신의 감정에 맞는 이미지를 선택하여 선호(like)를 표시하면 Personalize의 상호활동(interaction)에 대한 이벤트로 저장되어서 추후 추론(inferece)시에 좀더 개인화된 추천을 제시할 수 있게 됩니다. 

![image](https://user-images.githubusercontent.com/52392004/236751976-5a31399b-7a49-4c10-a0ed-e7e80e042252.png)


전체적인 시그널 흐름도(signal flow)는 아래를 참조합니다.

1) 시스템 관리자(administrator)는 감성에 맞게 Stable Diffusion을 이용해 생성하거나, 감성을 잘 표현하는 이미지를 적절히 분류하여 Amazon S3의 버켓(Bucket)에 복사합니다.
2) 복사된 이미지의 [put event](https://docs.aws.amazon.com/ko_kr/AmazonS3/latest/userguide/NotificationHowTo.html)를 이용하여 [aws lambda](https://aws.amazon.com/ko/lambda/)가 실행되면서 personalize에 putItem으로 아이템 데이터셋을 생성합니다.
3) 사용자가 카메라 앞에 있을때에 [Personalize의 detectFaces](https://docs.aws.amazon.com/rekognition/latest/APIReference/API_DetectFaces.html)를 이용해서 감성(emotion)을 분석합니다. 이후 [Personalize의 searchFaces](https://docs.aws.amazon.com/rekognition/latest/APIReference/API_SearchFaces.html)을 이용하여 사용자 아이디(userId)를 확인합니다. 만약 [Personalize의 Correction](https://docs.aws.amazon.com/rekognition/latest/dg/collections.html)에 등록되지 않은 얼굴(Face) 이미지의 경우에는 새로운 사용자 아이디(userId)로 생성합니다.
4) 사용자 아이디(userId)를 이용하여 [Personalize의 getRecommendations]을 이용하여 "감성 추천" 및 "개인화 추천"을 이용합니다. 
5) 사용자가 감성 이미지를 선택하는 경우에 상호작용(interaction)을 [Personalize의 putEvents](https://docs.aws.amazon.com/personalize/latest/dg/API_UBS_PutEvents.html)을 이용하여 상호작용 데이터셋을 생성합니다. 

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
