let emotions = [];
emotions.push("happy");
emotions.push("angry");
emotions.push("calm");
emotions.push("confused");
emotions.push("disgusted");
emotions.push("fear");
emotions.push("sad");
emotions.push("surprised");

function generateDataset(requestList) {    
    const xhr = new XMLHttpRequest();

    xhr.open("POST", "generateDataset", true);
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log("--> responseText: " + xhr.responseText);

            // let response = JSON.parse(xhr.responseText)
            // console.log("response: " + response.text);                    
        }
    };

    console.log("requestList: " + JSON.stringify(requestList));

    let blob = new Blob([JSON.stringify(requestList)], { type: 'application/json' });

    xhr.send(blob);
}

let repeatCount;
let form = document.forms.input_row0;
    
form.elements.send.onclick = function () {
    repeatCount = document.forms.input_row0.elements.repeatCount.value;
    console.log("repeatCount: " + repeatCount);
    
    let requestList = [];
    for(let i in emotions) {            
        let gender = "male";          
        let userId = `${emotions[i]}_${gender}`;
        console.log("userId: ", userId);

        let requiredDataset = {
            "userId": userId,
            "gender": gender,
            "emotion": emotions[i]
        };
        requestList.push(requiredDataset);

        gender = "female";          
        userId = `${emotions[i]}_${gender}`;
        console.log("userId: ", userId);

        requiredDataset = {
            "userId": userId,
            "gender": gender,
            "emotion": emotions[i]
        };
        requestList.push(requiredDataset);             
    } 
    console.log("requestList: ", JSON.stringify(requestList));

    generateDataset(requestList);   
    
    alert("Dataset 생성이 완료되었습니다.");    
};

