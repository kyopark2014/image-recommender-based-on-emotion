# 감성 이미지 추천

카메라로 사람의 표정을 분석하여 현재의 감성(Emotion)을 얻을 수 있다면, 추천 시스템에 유용하게 활용할 수 있습니다. 여기서는 Amazon Rekognition을 이용하여 현재 사용자의 감성을 얻고, 현재 감성을 잘 표현하는 이미지를 Amazon Personlize를 이용하여 추천합니다. 이를 통해 Amazozn의 완전관리형 서비스인 Rekognition과 Personlize를 효과적으로 사용하는 방법을 이해할 수 있습니다. 

감성을 표현하는 이미지는 Amazon SageMaker의 JumpStart의 Stable Diffusion 모델을 이용해 생성합니다. Stable Diffision 모델은 텍스트로 이미지를 생성하는 기초 모델 (Foundation Model)으로서, SageMaker JumpStart를 이용하면 이미지를 생성하는 Endpoint를 쉽게 만들어 활용할 수 있습니다. 

아래는 사용자의 감정에 따라 이미지를 추천하는 시스템 아키텍처를 소개합니다. 

![image](https://user-images.githubusercontent.com/52392004/233784271-75654db5-b939-4de4-a369-a0998f859156.png)


주요 단계는 아래와 같습니다.

1) Amazon SageMaker의 JumpStart에서 제공하는 Stable Diffusion 모델을 이용하여 다수의 이미지를 생성합니다.
2) 생성된 이미지에서 적합한 이미지 선택합니다.
3) 생성된 이미지를 실제 제공하기 위하여 CloudFront와 연결된 S3로 이동시킵니다.
4) Amazon Personalize에서 사용할 수 있도록 user, item, interaction 데이터셋을 생성합니다.
5) 생성된 데이터로 Solution, Campaign을 생성합니다.
6) 클라이언트를 이용하여 감성기반의 이미지 추천을 활용합니다.

## SageMaker JumpStart로 Stable Diffusion 설치

[Stable Diffusion 인프라 설치](./stable-diffusion-deployment.md)를 참조하여 Stable Diffusion을 위한 SageMaker Endpoint를 생성합니다. 

## Cloud9로 인프라 설치

[Cloud9로 인프라 설치](./deployment.md)을 참조하여 인프라를 설치합니다.

## 이미지 생성

[이미지 생성하기](https://github.com/kyopark2014/image-recommender-based-on-emotion/blob/main/image-generation.md)를 따라서 8개 감정에 대한 이미지를 생성합니다. 


## DataSet 만들기

#### Enabler 사용 준비

Personalize는 최소 25명 이상의 user와 최소 1000개 이상의 interaction 데이터가 있어야 합니다. 따라서 gallery에서 이미지를 보여주기 위해서는 먼저 최소한의 Traning Dateset을 준비하여야 합니다. 이를 위해 여기서는 Enabler를 이용하여 데이터를 수집합니다. Enabler는 DynamoDB에서 item 정보를 가져와서 감정에 따라 보여주고, 사용자읜 선호를 like로 수집합니다.

Enabler 실행하기 위해서는 아래와 같이 "tools/enabler" 폴더를 CloudFront와 연결된 S3 Bucket의 루트로 복사합니다.

```java
aws s3 cp ../tools/enabler/ s3://emotion-gallery/ --recursive 
```


#### Enabler를 이용한 User, Interaction 데이터 수집

아래 경로로 진입하여 Recommendation을 위한 기본 Dataset을 생성합니다. 

```java
https://d14j04tdmh4c1d.cloudfront.net/enabler.html
```

