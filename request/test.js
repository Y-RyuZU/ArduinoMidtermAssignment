const ARDUINO_IP = '192.168.11.105';

fetch(`http://${ARDUINO_IP}/api/config`, {
  method: 'POST',
  body: JSON.stringify({
    color1: '#002bff',
    color2: '#00FF00',
    duration: 5000,
    easing: 'linear',
    waveDelay: 0.2
  })
});


// カスタムベジェ曲線でアニメーション設定
// fetch(`http://${ARDUINO_IP}/api/config`, {
//   method: 'POST',
//   body: JSON.stringify({
//     color1: '#FF6B6B',
//     color2: '#4ECDC4',
//     duration: 4000,
//     waveDelay: 0.1,
//     easing: 'bezier',
//     bezier: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' // バウンス効果
//   })
// });


// アニメーション開始
fetch(`http://${ARDUINO_IP}/api/start`);