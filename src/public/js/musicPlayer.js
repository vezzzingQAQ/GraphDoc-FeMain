/**
 * 控制audio的播放
 * 
 * by vezzzing 2023.8.8
 * z z z studio
 */

import popSound from "./../../asset/audio/pop.wav";

export function playMusic(volume = 1) {
    var audio = document.createElement("audio");
    audio.volume = volume;
    audio.src = popSound;
    audio.play();
}
