/**
 * 控制audio的播放
 * 
 * by vezzzing 2023.8.8
 * z z z studio
 */

import popSound from "./../../asset/audio/pop.wav";
import pianoc from "./../../asset/audio/1.mp3";
import pianod from "./../../asset/audio/2.mp3";
import pianoe from "./../../asset/audio/3.mp3";
import pianof from "./../../asset/audio/4.mp3";
import pianog from "./../../asset/audio/5.mp3";
import pianoa from "./../../asset/audio/6.mp3";
import pianob from "./../../asset/audio/7.mp3";
import pianogc from "./../../asset/audio/g1.mp3";
import pianogd from "./../../asset/audio/g2.mp3";
import pianoge from "./../../asset/audio/g3.mp3";
import pianogf from "./../../asset/audio/g4.mp3";
import pianogg from "./../../asset/audio/g5.mp3";
import pianoga from "./../../asset/audio/g6.mp3";
import pianogb from "./../../asset/audio/g7.mp3";
import pianoggc from "./../../asset/audio/gg1.mp3";
import pianoggd from "./../../asset/audio/gg2.mp3";
import pianogge from "./../../asset/audio/gg3.mp3";

const soundType = {
    "pop": popSound,
    "1": pianoc,
    "2": pianod,
    "3": pianoe,
    "4": pianof,
    "5": pianog,
    "6": pianoa,
    "7": pianob,
    "G1": pianogc,
    "G2": pianogd,
    "G3": pianoge,
    "G4": pianogf,
    "G5": pianogg,
    "G6": pianoga,
    "G7": pianogb,
    "GG1": pianoggc,
    "GG2": pianoggd,
    "GG3": pianogge,
}

export function playMusic(type = "pop", volume = 1) {
    var audio = document.createElement("audio");
    audio.volume = volume;
    audio.src = soundType[type];
    audio.play();
}
