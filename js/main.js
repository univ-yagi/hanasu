// ホーム画面を表示
const init = () => {
    setTimeout(() => {
        $('.config').css({
            'left': '0%',
        });
    }, 100);

    // URLからIDを取得
    let ids = {};

    if (location.search.split("?").length >= 2) {
        let idList = location.search.split("?")[1].split("&");

        for (id in idList) {
            k = idList[id].split("=")[0];
            v = idList[id].split("=")[1];
            ids[k] = v;
        }
        setTimeout(() => {
            for (id in ids) {
                if (id === "my-id") {
                    document.getElementById('my-id').value = ids["my-id"];
                } else if (id === "their-id") {
                    document.getElementById('their-id').value = ids["their-id"];
                }
            }
        }, 3000);
    }
}

// 画面のスクロールを禁止
function noScroll(event) {
    event.preventDefault();
}
document.addEventListener('touchmove', noScroll, { passive: false });
document.addEventListener('mousewheel', noScroll, { passive: false });

// 画面を遷移
const translateView = () => {
    // 画面を遷移
    $('.config').css({
        'left': '-100%',
    });
    $('#refresh').css({
        'opacity': '1',
    });

    // 動画の表示領域を調整
    let headerHeight = $("h1").height();
    let windowHeight = $(window).height();

    $(".video-wrapper").css({
        'height': windowHeight - headerHeight,
        'left': '0%',
    });
}

// Debug
$("#debug").click(() => {
    translateView();

    // 感情認識
    FACE.EXPRESSION();
});

// ウィンドウサイズの変更に対応
$(window).resize(() => {
    $(".video-wrapper").css({
        'height': $(window).height() - $("h1").height(),
    });
});

// Peerを作成
$("#get-peer-id").click(() => {
    constructPeer();
});

const constructPeer = () => {
    myID = document.getElementById('my-id').value;
    if (myID) {
        const peer = (window.peer = new Peer(
            String(myID), { key: '0e304d6a-5406-4a28-8b42-a11f72a904f3', debug: 0 }
        ));
    } else {
        const peer = (window.peer = new Peer(
            String(Math.floor(Math.random() * 10)), { key: '0e304d6a-5406-4a28-8b42-a11f72a904f3', debug: 0 }
        ));
    }
    setTimeout(() => {
        try {
            if (peer.id) {
                $("#get-peer-id").text("OK");
                $("#get-peer-id").css({
                    'background-color': "#17b18d",
                    'color': "#fff",
                    'font-weight': "bold",
                });
                $('#make-call').css({
                    'pointer-events': 'all',
                });
            }
        } catch (e) {
            console.log(e);
        }
    }, 500)

    peer.on('open', () => {
        document.getElementById('my-id').value = peer.id;
    });

    // メディアチャネルで着信
    peer.on('call', mediaConnection => {
        // カメラ映像取得
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                const videoElm = document.getElementById('my-video')
                videoElm.srcObject = stream;
                videoElm.play();
                localStream = stream;

                mediaConnection.answer(localStream);
                setEventListener(mediaConnection);


                translateView();

                // 感情認識
                FACE.EXPRESSION();
            }).catch(error => {
                console.error('mediaDevice.getUserMedia() error:', error);
                return;
            });
    });

    // データチャネルで着信
    peer.on('connection', dataConnection => {
        dataConnection.once('open', async() => {
            setInterval(async() => {
                dataConnection.send(sendHappy);
                console.log(sendHappy);
            }, 500);
        });
        dataConnection.on('data', (data) => {
            receiveHappy = data;
        });
    });
}


// 発信
document.getElementById('make-call').onclick = () => {
    $('#make-call').css({
        'background-color': '#E5352E',
        'color': "#fff",
        'font-weight': "bold",
    });

    // カメラから映像を取得
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
            const videoElm = document.getElementById('my-video');
            videoElm.srcObject = stream;
            videoElm.play();
            localStream = stream;

            const theirID = document.getElementById('their-id').value;

            // Media connection
            mediaConnection = peer.call(theirID, localStream);
            setEventListener(mediaConnection);

            translateView();

            // 感情認識
            FACE.EXPRESSION();

            // Data connection
            dataConnection = peer.connect(theirID);
            dataConnection.once('open', async() => {
                setInterval(async() => {
                    // 笑顔の分析結果の値を送信
                    dataConnection.send(sendHappy);

                    // Debug
                    // console.log(sendHappy);
                }, 500);

            });

            // 笑顔の分析結果の値を受信
            dataConnection.on('data', (data) => {
                receiveHappy = data;
            });

        }).catch(error => {
            console.error('mediaDevice.getUserMedia() error:', error);
            return;
        });
};

// 画面を再読み込み
const refresh = () => {
    $('.container').css({
        'opacity': '0',
    });
    setTimeout(() => {
        document.location.reload();
    }, 1000);

}

// イベントリスナを設置
const setEventListener = mediaConnection => {
    mediaConnection.on('stream', stream => {
        const videoElm = document.getElementById('their-video')
        videoElm.srcObject = stream;
        videoElm.play();

        // 切断
        document.getElementById('refresh').addEventListener("click", () => {
            mediaConnection.close(true);
        });

    });
    mediaConnection.on('close', () => {
        refresh();
    });
}

init();