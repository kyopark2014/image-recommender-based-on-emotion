# 이미지 생성

## 이미지 생성 및 선택하기

웹브라우저에서 Output의 ImageGenerator로 접속합니다. 여기서는 "https://d2nnqu1h4mrgxo.cloudfront.net/imgGenerator.html"로 접속합니다. 아래와 같이 "RepeatCount"을 30으로 설정하고, "Emotion"으로 "행복(HAPPY)"을 선택한 후에 [Generate] 버튼을 선택합니다. 이미지 생성 상태는 [Updata] 버튼을 통해 확인할 수 있습니다. 

![noname](https://user-images.githubusercontent.com/52392004/235281180-709590e1-806d-4da9-b643-bd617b97bec3.png)

생성된 이미지가 적절하지 않다고 판단되면, 오른쪽의 "dislike"를 선택한 후에 [Remove]로 삭제합니다. 

Image Generator로 생성된 이미지들은 Preview에서 확인하고, 필요시 삭제할 수 있습니다. Preview의 url은 Output의 "Preview"을 참조합니다. 여기서 Preview의 url은 "https://d2nnqu1h4mrgxo.cloudfront.net/preview.html" 입니다. 

동일한 작업을 "놀람(SURPRISED)"등 나머지 7개 감정에 대해 수행합니다.

### Reference 이미지 업로드하기

실습을 위해 Reference 이미지를 업로드 할 수 있습니다.

```java
aws s3 cp ./samples/emotions/ s3://emotion-gallery/emotions/ --recursive
```

### 이미지를 Personalize에 반영하기

imgPool에 있는 이미지를 Cloud9으로 다운로드 합니다.

```java
cd ~/ && aws s3 cp s3://cdkimagerecommenderstack-imagerecommenderstorageb-1t32yos4phxfc/imgPool/ ./imgPool/ --recursive
```

"emotions" 폴더로 생성한 이미지들을 복사합니다. 

```java
aws s3 cp ./imgPool/ s3://cdkimagerecommenderstack-imagerecommenderstorageb-1t32yos4phxfc/emotions/ --recursive
```
