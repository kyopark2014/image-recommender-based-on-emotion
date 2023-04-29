# Stable Diffusion

1) SageMaker Jumpstart에서 "Stable Diffusion 2 FP16"을 검색한 후에 "Open notebook"을 선택합니다.

![noname](https://user-images.githubusercontent.com/52392004/233795862-8d99e819-3295-4912-8785-73bbb451af86.png)

2) 노트북의 마지막으로 이동하여 아래와 같이 "model_predictor.delete_model()"와 "model_predictor.delete_endpoint()"을 주석처리 합니다. 

3) 상단 메뉴의 [Run] - [Run All Cells]를 선택하여 Stable Diffusion Endopoint를 생성합니다. 

![noname](https://user-images.githubusercontent.com/52392004/233796121-b504f965-3c82-4c6e-9904-a3d9fce6de81.png)

4) Endpoint의 이름을 확인합니다.

[SageMaker Endpoint](https://ap-northeast-1.console.aws.amazon.com/sagemaker/home?region=ap-northeast-1#/endpoints)로 접속하여 생성된 SageMaker Endpoint의 이름을 확인합니다. 여기서는 "jumpstart-example-model-txt2img-stabili-2023-04-22-16-31-10-149"라는 Endpoint가 생성되었습니다.
