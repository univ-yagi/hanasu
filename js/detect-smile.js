const FACE = {};
let sendHappy = 0;
let receiveHappy = 0;

FACE.EXPRESSION = () => {
    const camera = document.getElementById('my-video'),
        emotionFrame = document.getElementById('emotion-frame'),
        intervalTime = 500;

    const initWeight = async() => {
            setCamera();
            await faceapi.nets.tinyFaceDetector.load("js/weights/");
            await faceapi.nets.faceExpressionNet.load("js/weights/");
        },

        setCamera = async() => {
            var constraints = {
                audio: false,
                video: {
                    facingMode: 'user'
                }
            };
            await navigator.mediaDevices.getUserMedia(constraints)
                .then((stream) => {
                    camera.srcObject = stream;
                    camera.onloadedmetadata = (e) => {
                        playCamera();
                    };
                })
                .catch((err) => {
                    console.log(err.name + ': ' + err.message);
                });
        },

        playCamera = () => {
            camera.play();
            setInterval(async() => {
                checkFace();
            }, intervalTime);
        },

        checkFace = async() => {
            let faceData = await faceapi.detectAllFaces(
                camera, new faceapi.TinyFaceDetectorOptions()
            ).withFaceExpressions();
            if (faceData.length) {
                sendHappy = faceData[0].expressions.happy;
            }
            // // Debug
            // console.log(sendHappy);

            if (receiveHappy) {
                if (receiveHappy > 0.75) {
                    emotionFrame.style.backgroundColor = '#fbbd10ff';
                } else if (receiveHappy > 0.5) {
                    emotionFrame.style.backgroundColor = '#fbbd10aa';
                } else if (receiveHappy > 0.25) {
                    emotionFrame.style.backgroundColor = '#fbbd1055';
                } else {
                    emotionFrame.style.backgroundColor = '#fbbd1000';
                }
            }


        };
    initWeight();
};