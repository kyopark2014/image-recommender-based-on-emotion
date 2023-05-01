let emotions = [];
emotions.push("happy");
emotions.push("angry");
emotions.push("calm");
emotions.push("confused");
emotions.push("disgusted");
emotions.push("fear");
emotions.push("sad");
emotions.push("surprised");

function generateDataset(userId, gender, emotion) {    
    const xhr = new XMLHttpRequest();

    xhr.open("POST", "generateDataset", true);
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log("--> responseText: " + xhr.responseText);

            // let response = JSON.parse(xhr.responseText)
            // console.log("response: " + response.text);                    
        }
    };

    let requestObj = {
        "userId": userId,
        "gender": gender,
        "fname": emotion
    };
    console.log("request: " + JSON.stringify(requestObj));

    let blob = new Blob([JSON.stringify(requestObj)], { type: 'application/json' });

    xhr.send(blob);
}

let repeatCount;
let form = document.forms.input_row1;
    
form.elements.send.onclick = function () {
    repeatCount = document.forms.input_row0.elements.repeatCount.value;
    console.log("repeatCount: " + repeatCount);
    
    let gender, userId;
    for(let i in emotions) {        
        gender = "male";          
        userId = `${emotions[i]}_${gender}`;
        console.log("userId: ", userId);
        generateDataset(userId, gender, emotions[i]);

        // sleep(200);            

        gender = "male";          
        userId = `${emotions[i]}_${gender}`;
        console.log("userId: ", userId);
        generateDataset(userId, gender, emotions[i]);        
    } 
    
    alert("Dataset 생성이 완료되었습니다.");    
};

