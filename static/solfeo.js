document.addEventListener("DOMContentLoaded", () => {
    const root = document.getElementById("solfeoApp");
    if (!root) return;

    const listEl = document.getElementById("solfeoExerciseList");
    const hostEl = document.getElementById("solfeoExerciseHost");
    if (!listEl || !hostEl) return;

    const noteNames = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
    const intervalBank = [
        { label: "m2", semitones: 1 },
        { label: "M2", semitones: 2 },
        { label: "m3", semitones: 3 },
        { label: "M3", semitones: 4 },
        { label: "P4", semitones: 5 },
        { label: "TT", semitones: 6 },
        { label: "P5", semitones: 7 },
        { label: "m6", semitones: 8 },
        { label: "M6", semitones: 9 },
        { label: "m7", semitones: 10 },
        { label: "M7", semitones: 11 },
        { label: "8a", semitones: 12 }
    ];
    const intervalSpokenMap = {
        m2: "segunda menor",
        M2: "segunda mayor",
        m3: "tercera menor",
        M3: "tercera mayor",
        P4: "cuarta justa",
        TT: "tritono",
        P5: "quinta justa",
        m6: "sexta menor",
        M6: "sexta mayor",
        m7: "septima menor",
        M7: "septima mayor",
        "8a": "octava justa",
        b9: "novena bemol",
        "9": "novena mayor",
        "#9": "novena sostenida",
        m9: "novena menor",
        M9: "novena mayor"
    };
    const chordBank = [
        { label: "Maj", shape: [0, 4, 7] },
        { label: "Min", shape: [0, 3, 7] },
        { label: "Dim", shape: [0, 3, 6] },
        { label: "Aug", shape: [0, 4, 8] },
        { label: "7", shape: [0, 4, 7, 10] },
        { label: "Maj7", shape: [0, 4, 7, 11] },
        { label: "Min7", shape: [0, 3, 7, 10] },
        { label: "m7b5", shape: [0, 3, 6, 10] }
    ];
    const majorScaleModes = [
        { label: "Ionian", steps: [0, 2, 4, 5, 7, 9, 11, 12] },
        { label: "Dorian", steps: [0, 2, 3, 5, 7, 9, 10, 12] },
        { label: "Phrygian", steps: [0, 1, 3, 5, 7, 8, 10, 12] },
        { label: "Lydian", steps: [0, 2, 4, 6, 7, 9, 11, 12] },
        { label: "Mixolydian", steps: [0, 2, 4, 5, 7, 9, 10, 12] },
        { label: "Aeolian", steps: [0, 2, 3, 5, 7, 8, 10, 12] },
        { label: "Locrian", steps: [0, 1, 3, 5, 6, 8, 10, 12] }
    ];
    const melodicMinorScaleModes = [
        { label: "Melodic Minor", steps: [0, 2, 3, 5, 7, 9, 11, 12] },
        { label: "Dorian b2", steps: [0, 1, 3, 5, 7, 9, 10, 12] },
        { label: "Lydian Augmented", steps: [0, 2, 4, 6, 8, 9, 11, 12] },
        { label: "Lydian Dominant", steps: [0, 2, 4, 6, 7, 9, 10, 12] },
        { label: "Mixolydian b6", steps: [0, 2, 4, 5, 7, 8, 10, 12] },
        { label: "Locrian #2", steps: [0, 2, 3, 5, 6, 8, 10, 12] },
        { label: "Super Locrian", steps: [0, 1, 3, 4, 6, 8, 10, 12] }
    ];
    const harmonicMinorScaleModes = [
        { label: "Harmonic Minor", steps: [0, 2, 3, 5, 7, 8, 11, 12] },
        { label: "Locrian #6", steps: [0, 1, 3, 5, 6, 9, 10, 12] },
        { label: "Ionian #5", steps: [0, 2, 4, 5, 8, 9, 11, 12] },
        { label: "Dorian #4", steps: [0, 2, 3, 6, 7, 9, 10, 12] },
        { label: "Phrygian Dominant", steps: [0, 1, 4, 5, 7, 8, 10, 12] },
        { label: "Lydian #2", steps: [0, 3, 4, 6, 7, 9, 11, 12] },
        { label: "Super Locrian bb7", steps: [0, 1, 3, 4, 6, 8, 9, 12] }
    ];
    const allScaleModes = [
        ...majorScaleModes,
        ...melodicMinorScaleModes,
        ...harmonicMinorScaleModes
    ];
    const keySignatures = [
        { label: "C major / A minor", acc: "0" },
        { label: "G major / E minor", acc: "1 sharp" },
        { label: "D major / B minor", acc: "2 sharps" },
        { label: "A major / F# minor", acc: "3 sharps" },
        { label: "E major / C# minor", acc: "4 sharps" },
        { label: "B major / G# minor", acc: "5 sharps" },
        { label: "F major / D minor", acc: "1 flat" },
        { label: "Bb major / G minor", acc: "2 flats" },
        { label: "Eb major / C minor", acc: "3 flats" },
        { label: "Ab major / F minor", acc: "4 flats" }
    ];
    const unattendedExerciseIds = new Set(["interval_ear", "chord_ear", "scale_ear"]);

    const state = {
        exerciseId: "",
        difficulty: "3",
        question: null,
        score: 0,
        total: 0,
        streak: 0,
        running: false,
        awaitingAnswer: false,
        nextTimer: null,
        keyHandler: null,
        modePlaybackRate: 1,
        unattendedMode: false,
        unattendedGapMs: 5000,
        roundToken: 0,
        miniPianoOpen: false,
        miniPianoBaseOctave: 3,
        miniPianoOctaves: 2
    };

    let audioCtx = null;
    let dryBus = null;
    let wetBus = null;
    let convolver = null;
    let compressor = null;
    const activeToneSources = new Set();

    const rint = (max) => Math.floor(Math.random() * max);
    const choice = (arr) => arr[rint(arr.length)];
    const midiToFreq = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const cancelSpeech = () => {
        if (!("speechSynthesis" in window)) return;
        window.speechSynthesis.cancel();
    };
    const speakText = (text) => new Promise((resolve) => {
        if (!("speechSynthesis" in window) || typeof window.SpeechSynthesisUtterance === "undefined") {
            resolve(false);
            return;
        }
        const message = String(text || "").trim();
        if (!message) {
            resolve(false);
            return;
        }
        const utt = new SpeechSynthesisUtterance(message);
        utt.lang = document.documentElement.lang || "es-ES";
        utt.rate = 0.9;
        utt.pitch = 1;
        utt.volume = 1;
        let done = false;
        const finish = () => {
            if (done) return;
            done = true;
            resolve(true);
        };
        utt.onend = finish;
        utt.onerror = finish;
        cancelSpeech();
        window.speechSynthesis.speak(utt);
    });

    const ensureAudio = async () => {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();

            const master = audioCtx.createGain();
            master.gain.value = 0.9;

            compressor = audioCtx.createDynamicsCompressor();
            compressor.threshold.value = -19;
            compressor.knee.value = 19;
            compressor.ratio.value = 2.8;
            compressor.attack.value = 0.01;
            compressor.release.value = 0.24;

            master.connect(compressor);
            compressor.connect(audioCtx.destination);

            dryBus = audioCtx.createGain();
            dryBus.gain.value = 0.78;
            dryBus.connect(master);

            wetBus = audioCtx.createGain();
            wetBus.gain.value = 0.58;
            wetBus.connect(master);

            convolver = audioCtx.createConvolver();
            convolver.buffer = createImpulseResponse(audioCtx, 4.6, 3.8);
            convolver.connect(wetBus);
        }

        if (audioCtx.state === "suspended") {
            await audioCtx.resume();
        }
    };

    const createImpulseResponse = (ctx, seconds, decay) => {
        const rate = ctx.sampleRate;
        const length = Math.floor(rate * seconds);
        const impulse = ctx.createBuffer(2, length, rate);
        for (let ch = 0; ch < impulse.numberOfChannels; ch += 1) {
            const data = impulse.getChannelData(ch);
            for (let i = 0; i < length; i += 1) {
                const tNorm = i / length;
                const env = Math.pow(1 - tNorm, decay);
                data[i] = (Math.random() * 2 - 1) * env;
            }
        }
        return impulse;
    };

    const playPianoTone = (freq, durMs = 1500, when = 0) => {
        const ctx = audioCtx;
        if (!ctx) return;

        const t0 = ctx.currentTime + when;
        const duration = Math.max(0.65, durMs / 1000);
        const voiceGain = ctx.createGain();
        const reverbSend = ctx.createGain();
        const lp = ctx.createBiquadFilter();
        const hs = ctx.createBiquadFilter();

        lp.type = "lowpass";
        lp.frequency.value = Math.min(6400, freq * 9);
        lp.Q.value = 1.1;
        hs.type = "highshelf";
        hs.frequency.value = 3400;
        hs.gain.value = -4;

        lp.connect(hs);
        hs.connect(voiceGain);
        voiceGain.connect(dryBus);
        voiceGain.connect(reverbSend);
        reverbSend.connect(convolver);

        voiceGain.gain.setValueAtTime(0.0001, t0);
        voiceGain.gain.exponentialRampToValueAtTime(0.52, t0 + 0.009);
        voiceGain.gain.exponentialRampToValueAtTime(0.28, t0 + 0.22);
        voiceGain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration + 0.82);
        reverbSend.gain.setValueAtTime(0.4, t0);
        reverbSend.gain.exponentialRampToValueAtTime(0.0001, t0 + duration + 1.1);

        const noiseLen = Math.max(0.02, duration * 0.03);
        const noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * noiseLen), ctx.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseData.length; i += 1) noiseData[i] = (Math.random() * 2 - 1) * 0.35;
        const noiseSrc = ctx.createBufferSource();
        noiseSrc.buffer = noiseBuffer;
        const noiseBp = ctx.createBiquadFilter();
        noiseBp.type = "bandpass";
        noiseBp.frequency.value = Math.min(4200, freq * 6);
        noiseBp.Q.value = 1.1;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.0001, t0);
        noiseGain.gain.exponentialRampToValueAtTime(0.08, t0 + 0.003);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, t0 + noiseLen + 0.012);
        noiseSrc.connect(noiseBp);
        noiseBp.connect(noiseGain);
        noiseGain.connect(voiceGain);
        activeToneSources.add(noiseSrc);
        noiseSrc.onended = () => activeToneSources.delete(noiseSrc);
        noiseSrc.start(t0);
        noiseSrc.stop(t0 + noiseLen + 0.02);

        const partials = [1, 2, 3, 4, 5, 6, 8];
        const amps = [1.0, 0.5, 0.32, 0.22, 0.16, 0.11, 0.07];
        partials.forEach((mult, idx) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            const p = ctx.createStereoPanner();
            osc.type = idx % 2 === 0 ? "triangle" : "sine";
            osc.frequency.value = freq * mult;
            osc.detune.value = (Math.random() * 2 - 1) * 2.2;
            p.pan.value = Math.max(-0.35, Math.min(0.35, (idx - 2) * 0.08));
            g.gain.value = amps[idx] * (1 - idx / (partials.length + 2));
            osc.connect(g);
            g.connect(p);
            p.connect(lp);
            activeToneSources.add(osc);
            osc.onended = () => activeToneSources.delete(osc);
            osc.start(t0);
            osc.stop(t0 + duration + 1.0);
        });
    };

    const stopAllTonesNow = () => {
        activeToneSources.forEach((src) => {
            try { src.stop(0); } catch (_) {}
            try { src.disconnect(); } catch (_) {}
        });
        activeToneSources.clear();
    };

    const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

    const getDifficultyConfig = () => {
        const level = Number(state.difficulty) || 3;
        if (level <= 1) return { intervalMaxSemitones: 7, choices: 4 };
        if (level === 2) return { intervalMaxSemitones: 9, choices: 5 };
        if (level === 3) return { intervalMaxSemitones: 11, choices: 6 };
        if (level === 4) return { intervalMaxSemitones: 12, choices: 8 };
        return { intervalMaxSemitones: 12, choices: 10 };
    };

    const getScaleModesForDifficulty = () => {
        const level = Number(state.difficulty) || 3;
        if (level <= 2) {
            return majorScaleModes.filter((m) => ["Ionian", "Dorian", "Mixolydian", "Aeolian"].includes(m.label));
        }
        if (level >= 5) {
            return allScaleModes;
        }
        return majorScaleModes;
    };

    const getPhraseDifficultyConfig = () => {
        const level = Number(state.difficulty) || 3;
        if (level <= 1) return { length: 4, maxLeap: 2, choices: 4 };
        if (level === 2) return { length: 5, maxLeap: 4, choices: 5 };
        if (level === 3) return { length: 6, maxLeap: 5, choices: 6 };
        if (level === 4) return { length: 7, maxLeap: 7, choices: 7 };
        return { length: 8, maxLeap: 11, choices: 8 };
    };

    const mkChoices = (answer, pool, count = 6, sortAscending = false) => {
        const normalizedPool = pool.includes(answer) ? [...pool] : [...pool, answer];
        const picked = [answer];
        const candidates = shuffle(normalizedPool.filter((x) => x !== answer));
        while (picked.length < Math.min(count, normalizedPool.length) && candidates.length) {
            picked.push(candidates.shift());
        }
        if (sortAscending) {
            return normalizedPool.filter((x) => picked.includes(x));
        }
        return shuffle(picked);
    };

    const noteNameFromMidi = (midi) => noteNames[((midi % 12) + 12) % 12];
    const miniPianoWhiteLayout = [
        { label: "C", whiteOffset: 0, blackOffset: 1, blackLabel: "C#" },
        { label: "D", whiteOffset: 2, blackOffset: 3, blackLabel: "D#" },
        { label: "E", whiteOffset: 4, blackOffset: null, blackLabel: "" },
        { label: "F", whiteOffset: 5, blackOffset: 6, blackLabel: "F#" },
        { label: "G", whiteOffset: 7, blackOffset: 8, blackLabel: "G#" },
        { label: "A", whiteOffset: 9, blackOffset: 10, blackLabel: "A#" },
        { label: "B", whiteOffset: 11, blackOffset: null, blackLabel: "" }
    ];
    const playMiniPianoNote = async (midi) => {
        await ensureAudio();
        playPianoTone(midiToFreq(midi), 980, 0);
    };
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    const phraseToLabel = (midis) => midis.map((m) => noteNameFromMidi(m)).join(" - ");
    const buildPhraseFromRoot = (rootMidi, length, maxLeap) => {
        const phrase = [rootMidi];
        let current = rootMidi;
        while (phrase.length < length) {
            const leap = (rint(maxLeap) + 1) * (Math.random() > 0.5 ? 1 : -1);
            let next = current + leap;
            if (next < 48) next = current + Math.abs(leap);
            if (next > 84) next = current - Math.abs(leap);
            next = Math.max(48, Math.min(84, next));
            phrase.push(next);
            current = next;
        }
        return phrase;
    };
    const spokenAnswerFor = (exerciseId, answerText) => {
        const raw = String(answerText || "").trim();
        if (!raw) return "";
        if (exerciseId === "interval_ear") {
            return intervalSpokenMap[raw] || raw;
        }
        return raw;
    };

    const exercises = [
        {
            id: "interval_ear",
            title: "Intervals by Ear",
            desc: "Listen to two notes and identify the interval.",
            generate: () => {
                const diff = getDifficultyConfig();
                const allowed = intervalBank.filter((x) => x.semitones <= diff.intervalMaxSemitones);
                const interval = choice(allowed);
                const base = 52 + rint(18);
                return {
                    prompt: "Identify the interval",
                    answer: interval.label,
                    choices: mkChoices(interval.label, allowed.map((x) => x.label), Math.min(9, allowed.length), true),
                    play: async () => {
                        playPianoTone(midiToFreq(base), 1700, 0);
                        playPianoTone(midiToFreq(base + interval.semitones), 1700, 1.1);
                    }
                };
            }
        },
        {
            id: "chord_ear",
            title: "Chord Quality by Ear",
            desc: "Hear the chord and pick its quality.",
            generate: () => {
                const diff = getDifficultyConfig();
                const chord = choice(chordBank);
                const base = 48 + rint(20);
                return {
                    prompt: "Identify chord quality",
                    answer: chord.label,
                    choices: mkChoices(chord.label, chordBank.map((x) => x.label), Math.min(diff.choices + 1, chordBank.length)),
                    play: async () => {
                        chord.shape.forEach((st, i) => playPianoTone(midiToFreq(base + st), 2100, i * 0.02));
                        await wait(1250);
                        chord.shape.forEach((st, i) => playPianoTone(midiToFreq(base + st), 950, i * 0.25));
                    }
                };
            }
        },
        {
            id: "scale_ear",
            title: "Mode by Ear",
            desc: "Listen to a scale and identify the mode.",
            generate: () => {
                const diff = getDifficultyConfig();
                const modePool = getScaleModesForDifficulty();
                const mode = choice(modePool);
                const base = 50 + rint(10);
                return {
                    prompt: "Identify the mode",
                    answer: mode.label,
                    choices: mkChoices(mode.label, modePool.map((x) => x.label), Math.min(diff.choices + 1, modePool.length)),
                    play: async () => {
                        const speed = Math.max(0.6, Math.min(1.4, Number(state.modePlaybackRate) || 1));
                        const upDur = 900 / speed;
                        const upStep = 0.35 / speed;
                        const downDur = 650 / speed;
                        const downStep = 0.26 / speed;
                        const between = 2800 / speed;
                        mode.steps.forEach((st, i) => playPianoTone(midiToFreq(base + st), upDur, i * upStep));
                        await wait(between);
                        [...mode.steps].reverse().forEach((st, i) => playPianoTone(midiToFreq(base + st), downDur, i * downStep));
                    }
                };
            }
        },
        {
            id: "note_ear",
            title: "Single Note ID",
            desc: "Hear one note and identify its pitch class.",
            generate: () => {
                const diff = getDifficultyConfig();
                const midi = 54 + rint(18);
                const answer = noteNameFromMidi(midi);
                return {
                    prompt: "Which note is this?",
                    answer,
                    choices: mkChoices(answer, noteNames, Math.min(diff.choices + 2, noteNames.length)),
                    play: async () => {
                        playPianoTone(midiToFreq(midi), 1900, 0);
                    }
                };
            }
        },
        {
            id: "interval_theory",
            title: "Interval Construction",
            desc: "Build notes mentally from interval names.",
            generate: () => {
                const diff = getDifficultyConfig();
                const allowed = intervalBank.filter((x) => x.semitones <= diff.intervalMaxSemitones);
                const rootIndex = rint(noteNames.length);
                const iv = choice(allowed);
                const answer = noteNames[(rootIndex + iv.semitones) % 12];
                return {
                    prompt: `${iv.label} above ${noteNames[rootIndex]} is...`,
                    answer,
                    choices: mkChoices(answer, noteNames, Math.min(diff.choices + 2, noteNames.length)),
                    play: async () => {
                        const rootMidi = 60 + rootIndex;
                        playPianoTone(midiToFreq(rootMidi), 1600, 0);
                        playPianoTone(midiToFreq(rootMidi + iv.semitones), 1600, 1.0);
                    }
                };
            }
        },
        {
            id: "chord_theory",
            title: "Chord Spelling",
            desc: "Pick the correct note set for each chord symbol.",
            generate: () => {
                const diff = getDifficultyConfig();
                const rootIndex = rint(noteNames.length);
                const chord = choice(chordBank);
                const root = noteNames[rootIndex];
                const notes = chord.shape.map((st) => noteNames[(rootIndex + st) % 12]);
                const answer = notes.join(" - ");
                const wrong = new Set();
                while (wrong.size < 5) {
                    const mod = [...chord.shape];
                    const i = rint(mod.length);
                    mod[i] = Math.max(0, Math.min(12, mod[i] + (Math.random() > 0.5 ? 1 : -1)));
                    const wrongNotes = mod.map((st) => noteNames[(rootIndex + st) % 12]).join(" - ");
                    if (wrongNotes !== answer) wrong.add(wrongNotes);
                }
                return {
                    prompt: `Spell ${root}${chord.label}`,
                    answer,
                    choices: shuffle([answer, ...Array.from(wrong)]).slice(0, Math.min(diff.choices + 1, 6)),
                    play: async () => {
                        const rootMidi = 55 + rootIndex;
                        chord.shape.forEach((st, i) => playPianoTone(midiToFreq(rootMidi + st), 1800, i * 0.02));
                        await wait(1200);
                        chord.shape.forEach((st, i) => playPianoTone(midiToFreq(rootMidi + st), 900, i * 0.22));
                    }
                };
            }
        },
        {
            id: "key_signature",
            title: "Key Signatures",
            desc: "Map accidentals to key center quickly.",
            generate: () => {
                const diff = getDifficultyConfig();
                const item = choice(keySignatures);
                const tonicMap = {
                    "C major / A minor": 60,
                    "G major / E minor": 67,
                    "D major / B minor": 62,
                    "A major / F# minor": 69,
                    "E major / C# minor": 64,
                    "B major / G# minor": 71,
                    "F major / D minor": 65,
                    "Bb major / G minor": 58,
                    "Eb major / C minor": 63,
                    "Ab major / F minor": 68
                };
                const tonic = tonicMap[item.label] || 60;
                return {
                    prompt: `Key signature with ${item.acc}`,
                    answer: item.label,
                    choices: mkChoices(item.label, keySignatures.map((x) => x.label), Math.min(diff.choices + 1, keySignatures.length)),
                    play: async () => {
                        playPianoTone(midiToFreq(tonic), 1500, 0);
                        playPianoTone(midiToFreq(tonic + 4), 1500, 0.02);
                        playPianoTone(midiToFreq(tonic + 7), 1500, 0.04);
                        await wait(1100);
                        playPianoTone(midiToFreq(tonic), 1800, 0);
                    }
                };
            }
        },
        {
            id: "phrase_transcription",
            title: "Phrase Transcription",
            desc: "Given the first note, transcribe the phrase.",
            generate: () => {
                const cfg = getPhraseDifficultyConfig();
                const root = 54 + rint(14);
                const phrase = buildPhraseFromRoot(root, cfg.length, cfg.maxLeap);
                const answer = phraseToLabel(phrase);
                const wrong = new Set();
                let guard = 0;
                while (wrong.size < Math.max(3, cfg.choices - 1) && guard < 120) {
                    guard += 1;
                    const alt = [...phrase];
                    const idx = 1 + rint(Math.max(1, alt.length - 1));
                    const shift = (rint(Math.max(2, cfg.maxLeap)) + 1) * (Math.random() > 0.5 ? 1 : -1);
                    alt[idx] = Math.max(48, Math.min(84, alt[idx] + shift));
                    const label = phraseToLabel(alt);
                    if (label !== answer) wrong.add(label);
                }
                return {
                    prompt: `First note: ${noteNameFromMidi(root)}. Transcribe the phrase`,
                    answer,
                    choices: shuffle([answer, ...Array.from(wrong)]).slice(0, cfg.choices),
                    play: async () => {
                        const speed = Math.max(0.6, Math.min(1.4, Number(state.modePlaybackRate) || 1));
                        const rootDur = 1050 / speed;
                        const introWait = 900 / speed;
                        const noteDur = 650 / speed;
                        const noteStep = 0.42 / speed;
                        playPianoTone(midiToFreq(root), rootDur, 0);
                        await wait(introWait);
                        phrase.forEach((midi, i) => playPianoTone(midiToFreq(midi), noteDur, i * noteStep));
                    }
                };
            }
        },
        {
            id: "rhythm_trainer",
            title: "Rhythm Trainer",
            desc: "Identify subdivision by ear.",
            generate: () => {
                const styles = [
                    { label: "Straight 8ths", times: [0, 0.5, 1.0, 1.5] },
                    { label: "Triplet feel", times: [0, 0.333, 0.666, 1.0, 1.333, 1.666] },
                    { label: "16ths", times: [0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75] },
                    { label: "Swing 8ths", times: [0, 0.66, 1.0, 1.66] },
                ];
                const style = choice(styles);
                return {
                    prompt: "Which rhythm subdivision is this?",
                    answer: style.label,
                    choices: styles.map((x) => x.label),
                    play: async () => {
                        const base = 64;
                        style.times.forEach((tVal) => playPianoTone(midiToFreq(base), 260, tVal * 0.9));
                    }
                };
            }
        },
        {
            id: "sight_sing",
            title: "Sight/Sing Bridge",
            desc: "Read a tiny pattern and identify final note.",
            generate: () => {
                const patterns = [
                    { text: "Do Re Mi", steps: [0, 2, 4] },
                    { text: "Mi Re Do", steps: [4, 2, 0] },
                    { text: "Do Mi Sol", steps: [0, 4, 7] },
                    { text: "Sol Fa Mi Re", steps: [7, 5, 4, 2] },
                ];
                const p = choice(patterns);
                const rootIdx = rint(12);
                const answer = noteNames[(rootIdx + p.steps[p.steps.length - 1]) % 12];
                return {
                    prompt: `${p.text} -> final note is...`,
                    answer,
                    choices: noteNames,
                    play: async () => {
                        const base = 60 + rootIdx;
                        p.steps.forEach((st, i) => playPianoTone(midiToFreq(base + st), 700, i * 0.45));
                    }
                };
            }
        }
    ];

    const getExercise = () => exercises.find((x) => x.id === state.exerciseId) || exercises[0];
    const intervalOrder = intervalBank.map((x) => x.label);
    const chordOrder = chordBank.map((x) => x.label);
    const modeOrder = allScaleModes.map((x) => x.label);
    const keyOrder = keySignatures.map((x) => x.label);
    const noteOrder = noteNames;
    const rhythmOrder = ["Straight 8ths", "Swing 8ths", "Triplet feel", "16ths"];
    const orderIndex = (arr, value) => {
        const idx = arr.indexOf(value);
        return idx >= 0 ? idx : Number.MAX_SAFE_INTEGER;
    };
    const sortChoicesForExercise = (exerciseId, choices) => {
        const list = Array.isArray(choices) ? [...choices] : [];
        const rankFor = (value) => {
            if (exerciseId === "interval_ear") return orderIndex(intervalOrder, value);
            if (exerciseId === "chord_ear") return orderIndex(chordOrder, value);
            if (exerciseId === "scale_ear") return orderIndex(modeOrder, value);
            if (exerciseId === "note_ear" || exerciseId === "interval_theory") return orderIndex(noteOrder, value);
            if (exerciseId === "key_signature") return orderIndex(keyOrder, value);
            if (exerciseId === "rhythm_trainer") return orderIndex(rhythmOrder, value);
            if (exerciseId === "sight_sing") return orderIndex(noteOrder, value);
            return Number.MAX_SAFE_INTEGER;
        };
        return list.sort((a, b) => {
            const ra = rankFor(a);
            const rb = rankFor(b);
            if (ra !== rb) return ra - rb;
            return String(a).localeCompare(String(b), "en", { sensitivity: "base" });
        });
    };
    const getExerciseIcon = (id) => {
        const map = {
            interval_ear: "I",
            chord_ear: "C",
            scale_ear: "M",
            note_ear: "N",
            interval_theory: "TI",
            chord_theory: "TC",
            key_signature: "KS",
            phrase_transcription: "PT",
            rhythm_trainer: "RT",
            sight_sing: "SS"
        };
        return map[id] || "S";
    };

    const renderList = () => {
        listEl.innerHTML = "";
        exercises.forEach((ex) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "solfeo-ex-btn";
            btn.innerHTML = `
                <span class="solfeo-ex-icon">${getExerciseIcon(ex.id)}</span>
                <span class="solfeo-ex-content">
                    <strong>${ex.title}</strong>
                    <small>${ex.desc}</small>
                </span>
            `;
            btn.classList.toggle("active", ex.id === state.exerciseId);
            btn.addEventListener("click", () => {
                state.exerciseId = ex.id;
                state.running = false;
                state.awaitingAnswer = false;
                cancelSpeech();
                if (state.nextTimer) clearTimeout(state.nextTimer);
                state.nextTimer = null;
                state.question = null;
                state.score = 0;
                state.total = 0;
                state.streak = 0;
                renderList();
                root.querySelector(".solfeo-hub")?.classList.add("has-exercise");
                renderHost();
            });
            listEl.appendChild(btn);
        });
    };

    const buildPanel = () => {
        const ex = getExercise();
        const icon = getExerciseIcon(ex.id);
        const wrapper = document.createElement("div");
        wrapper.className = "solfeo-panel";
        const unattendedControl = unattendedExerciseIds.has(ex.id)
            ? `
                <label class="solfeo-difficulty">
                    <span>Modo siesta</span>
                    <select id="solfeoUnattendedMode">
                        <option value="off">Off</option>
                        <option value="on">On (audio)</option>
                    </select>
                </label>
                <label class="solfeo-difficulty">
                    <span>Pausa entre retos</span>
                    <select id="solfeoUnattendedGap">
                        <option value="3000">3s</option>
                        <option value="5000">5s</option>
                        <option value="8000">8s</option>
                        <option value="12000">12s</option>
                    </select>
                </label>
            `
            : "";
        const modeSpeedControl = (ex.id === "scale_ear" || ex.id === "phrase_transcription")
            ? `
                <label class="solfeo-difficulty">
                    <span>Playback</span>
                    <select id="solfeoModeSpeed">
                        <option value="0.7">70%</option>
                        <option value="0.85">85%</option>
                        <option value="1">100%</option>
                        <option value="1.15">115%</option>
                        <option value="1.3">130%</option>
                    </select>
                </label>
            `
            : "";
        wrapper.innerHTML = `
            <div class="solfeo-title-row">
                <span class="solfeo-ex-icon hero">${icon}</span>
                <div class="solfeo-title-copy">
                    <div id="solfeoPrompt" class="solfeo-prompt">${ex.title}</div>
                    <p class="solfeo-explain">${ex.desc}</p>
                </div>
                <div class="solfeo-title-actions">
                    <button type="button" id="solfeoPianoToggle" class="solfeo-title-icon-btn" title="Mini piano">♪</button>
                </div>
            </div>
            <div id="solfeoMiniPiano" class="solfeo-mini-piano-wrap${state.miniPianoOpen ? "" : " is-collapsed"}"></div>
            <div class="solfeo-toolbar">
                <button type="button" id="solfeoBackBtn" class="solfeo-back-btn" title="Back">←</button>
                <button type="button" id="solfeoStartBtn">Lanca repte</button>
                <button type="button" id="solfeoRepeatBtn">Repeat</button>
                <button type="button" id="solfeoRevealBtn">Reveal</button>
                <button type="button" id="solfeoNextBtn">Next</button>
                <label class="solfeo-difficulty">
                    <span>Difficulty</span>
                    <select id="solfeoDifficulty">
                        <option value="1">Level 1</option>
                        <option value="2">Level 2</option>
                        <option value="3">Level 3</option>
                        <option value="4">Level 4</option>
                        <option value="5">Level 5</option>
                    </select>
                </label>
                ${modeSpeedControl}
                ${unattendedControl}
            </div>
            <div id="solfeoOptions" class="solfeo-options"></div>
            <div class="solfeo-help">Hotkeys: 1-9 answer, P repeat, N next, R reveal.</div>
            <div class="solfeo-info-stack">
                <div class="solfeo-stats">
                    <span><strong>Score</strong>: <span id="solfeoScore">0</span></span>
                    <span><strong>Total</strong>: <span id="solfeoTotal">0</span></span>
                    <span><strong>Streak</strong>: <span id="solfeoStreak">0</span></span>
                </div>
                <div id="solfeoFeedback" class="solfeo-feedback">Choose an exercise and press start.</div>
            </div>
        `;
        return wrapper;
    };

    const renderHost = () => {
        const ex = getExercise();
        hostEl.innerHTML = "";
        hostEl.appendChild(buildPanel());
        const prompt = hostEl.querySelector("#solfeoPrompt");
        const scoreEl = hostEl.querySelector("#solfeoScore");
        const totalEl = hostEl.querySelector("#solfeoTotal");
        const streakEl = hostEl.querySelector("#solfeoStreak");
        const feedback = hostEl.querySelector("#solfeoFeedback");
        const options = hostEl.querySelector("#solfeoOptions");
        const startBtn = hostEl.querySelector("#solfeoStartBtn");
        const repeatBtn = hostEl.querySelector("#solfeoRepeatBtn");
        const revealBtn = hostEl.querySelector("#solfeoRevealBtn");
        const nextBtn = hostEl.querySelector("#solfeoNextBtn");
        const diffSel = hostEl.querySelector("#solfeoDifficulty");
        const speedSel = hostEl.querySelector("#solfeoModeSpeed");
        const unattendedModeSel = hostEl.querySelector("#solfeoUnattendedMode");
        const unattendedGapSel = hostEl.querySelector("#solfeoUnattendedGap");
        const backBtn = hostEl.querySelector("#solfeoBackBtn");
        const pianoToggleBtn = hostEl.querySelector("#solfeoPianoToggle");
        const miniPianoWrap = hostEl.querySelector("#solfeoMiniPiano");
        const unattendedSupported = unattendedExerciseIds.has(ex.id);

        const renderMiniPiano = () => {
            if (!miniPianoWrap) return;
            miniPianoWrap.innerHTML = "";

            const minOctaves = 2;
            const maxOctaves = 5;
            const minBase = 1;
            const maxTopOctave = 7;
            state.miniPianoOctaves = clamp(Number(state.miniPianoOctaves) || 2, minOctaves, maxOctaves);
            state.miniPianoBaseOctave = clamp(
                Number(state.miniPianoBaseOctave) || 3,
                minBase,
                maxTopOctave - state.miniPianoOctaves + 1
            );

            const controls = document.createElement("div");
            controls.className = "solfeo-mini-controls";
            controls.innerHTML = `
                <label class="solfeo-mini-control">
                    <span>Registro: C${state.miniPianoBaseOctave} - B${state.miniPianoBaseOctave + state.miniPianoOctaves - 1}</span>
                    <input id="solfeoMiniBaseRange" type="range" min="${minBase}" max="${maxTopOctave - state.miniPianoOctaves + 1}" step="1" value="${state.miniPianoBaseOctave}">
                </label>
                <label class="solfeo-mini-control">
                    <span>Octavas visibles: ${state.miniPianoOctaves}</span>
                    <input id="solfeoMiniOctavesRange" type="range" min="${minOctaves}" max="${maxOctaves}" step="1" value="${state.miniPianoOctaves}">
                </label>
            `;
            miniPianoWrap.appendChild(controls);

            const scroll = document.createElement("div");
            scroll.className = "solfeo-mini-piano-scroll";
            const board = document.createElement("div");
            board.className = "solfeo-mini-piano";
            board.style.gridTemplateColumns = `repeat(${state.miniPianoOctaves * 7}, minmax(34px, 1fr))`;

            for (let octave = 0; octave < state.miniPianoOctaves; octave += 1) {
                const displayOctave = state.miniPianoBaseOctave + octave;
                miniPianoWhiteLayout.forEach((info) => {
                    const slot = document.createElement("div");
                    slot.className = "solfeo-piano-slot";

                    const whiteMidi = (displayOctave + 1) * 12 + info.whiteOffset;
                    const whiteKey = document.createElement("button");
                    whiteKey.type = "button";
                    whiteKey.className = "solfeo-piano-key white";
                    whiteKey.title = `${info.label}${displayOctave}`;
                    whiteKey.textContent = info.label;
                    whiteKey.addEventListener("mousedown", async (evt) => {
                        evt.preventDefault();
                        await playMiniPianoNote(whiteMidi);
                    });
                    slot.appendChild(whiteKey);

                    if (info.blackOffset !== null) {
                        const blackMidi = (displayOctave + 1) * 12 + info.blackOffset;
                        const blackKey = document.createElement("button");
                        blackKey.type = "button";
                        blackKey.className = "solfeo-piano-key black";
                        blackKey.title = `${info.blackLabel}${displayOctave}`;
                        blackKey.textContent = info.blackLabel;
                        blackKey.addEventListener("mousedown", async (evt) => {
                            evt.preventDefault();
                            await playMiniPianoNote(blackMidi);
                        });
                        slot.appendChild(blackKey);
                    }
                    board.appendChild(slot);
                });
            }
            scroll.appendChild(board);
            miniPianoWrap.appendChild(scroll);

            const baseRange = miniPianoWrap.querySelector("#solfeoMiniBaseRange");
            const octavesRange = miniPianoWrap.querySelector("#solfeoMiniOctavesRange");
            if (baseRange) {
                baseRange.addEventListener("input", () => {
                    state.miniPianoBaseOctave = Number(baseRange.value) || 3;
                    renderMiniPiano();
                });
            }
            if (octavesRange) {
                octavesRange.addEventListener("input", () => {
                    state.miniPianoOctaves = Number(octavesRange.value) || 2;
                    renderMiniPiano();
                });
            }
        };

        const paintStats = () => {
            scoreEl.innerText = String(state.score);
            totalEl.innerText = String(state.total);
            streakEl.innerText = String(state.streak);
        };

        const setFeedback = (msg, kind = "") => {
            feedback.innerText = msg;
            feedback.classList.remove("ok", "bad");
            if (kind) feedback.classList.add(kind);
        };

        const renderChoices = () => {
            options.innerHTML = "";
            if (!state.question) return;
            const orderedChoices = sortChoicesForExercise(ex.id, state.question.choices);
            orderedChoices.forEach((text, idx) => {
                const b = document.createElement("button");
                b.type = "button";
                b.className = "solfeo-option";
                b.dataset.idx = String(idx + 1);
                b.dataset.value = String(text);
                b.innerText = `${idx + 1}. ${text}`;
                b.addEventListener("click", () => answer(text));
                options.appendChild(b);
            });
        };

        const markAnswerButtons = (picked, answerText) => {
            const buttons = Array.from(options.querySelectorAll(".solfeo-option"));
            buttons.forEach((btn) => {
                const val = String(btn.dataset.value || "");
                if (val === answerText) btn.classList.add("is-correct");
                if (val === picked && val !== answerText) btn.classList.add("is-wrong");
            });
        };

        const playCurrent = async () => {
            if (!state.question || !state.question.play) return;
            await ensureAudio();
            await state.question.play();
        };

        const speakAnswerAudio = async (answerText) => {
            const spokenAnswer = spokenAnswerFor(ex.id, answerText);
            const spoken = await speakText(`Respuesta: ${spokenAnswer}`);
            if (!spoken) {
                setFeedback(`Respuesta: ${answerText} (audio TTS no disponible en este navegador)`);
                return false;
            }
            return true;
        };

        const nextRound = async () => {
            if (!state.running) return;
            cancelSpeech();
            if (state.nextTimer) clearTimeout(state.nextTimer);
            state.nextTimer = null;
            state.roundToken += 1;
            const token = state.roundToken;
            state.question = ex.generate();
            state.awaitingAnswer = !(state.unattendedMode && unattendedSupported);
            prompt.innerText = state.question.prompt;
            setFeedback(state.awaitingAnswer ? "Listen / think and answer." : "Modo siesta: escucha, luego se anuncia la respuesta.");
            renderChoices();
            await playCurrent();

            if (!state.running || token !== state.roundToken) return;
            if (state.unattendedMode && unattendedSupported && state.question) {
                const answerText = state.question.answer;
                await wait(4000);
                if (!state.running || token !== state.roundToken) return;
                await speakAnswerAudio(answerText);
                if (!state.running || token !== state.roundToken) return;
                setFeedback(`Respuesta: ${answerText}`);
                if (state.nextTimer) clearTimeout(state.nextTimer);
                state.nextTimer = setTimeout(() => {
                    nextRound();
                }, state.unattendedGapMs);
            }
        };

        const answer = (picked) => {
            if (!state.awaitingAnswer || !state.question) return;
            state.awaitingAnswer = false;
            const isModeByEarManual = ex.id === "scale_ear" && !state.unattendedMode;
            const ok = picked === state.question.answer;
            if (ok || isModeByEarManual) stopAllTonesNow();
            const answerText = state.question.answer;
            state.total += 1;
            if (ok) {
                state.score += 1;
                state.streak += 1;
                setFeedback(`Correct: ${answerText}`, "ok");
            } else {
                state.streak = 0;
                setFeedback(`Wrong. Answer: ${answerText}`, "bad");
                if (isModeByEarManual) markAnswerButtons(picked, answerText);
            }
            paintStats();
            if (state.nextTimer) clearTimeout(state.nextTimer);
            const manualNext = isModeByEarManual && !ok;
            if (!manualNext) {
                state.nextTimer = setTimeout(() => {
                    nextRound();
                }, 650);
            }
        };

        startBtn.addEventListener("click", async () => {
            state.running = true;
            await nextRound();
        });

        repeatBtn.addEventListener("click", async () => {
            await playCurrent();
        });

        revealBtn.addEventListener("click", () => {
            if (!state.question) return;
            setFeedback(`Answer: ${state.question.answer}`);
        });

        nextBtn.addEventListener("click", async () => {
            state.running = true;
            await nextRound();
        });

        if (miniPianoWrap) {
            renderMiniPiano();
            miniPianoWrap.classList.toggle("is-collapsed", !state.miniPianoOpen);
        }

        if (pianoToggleBtn && miniPianoWrap) {
            pianoToggleBtn.classList.toggle("is-active", state.miniPianoOpen);
            pianoToggleBtn.addEventListener("click", () => {
                state.miniPianoOpen = !state.miniPianoOpen;
                miniPianoWrap.classList.toggle("is-collapsed", !state.miniPianoOpen);
                pianoToggleBtn.classList.toggle("is-active", state.miniPianoOpen);
            });
        }

        if (backBtn) {
            backBtn.addEventListener("click", () => {
                state.running = false;
                state.awaitingAnswer = false;
                cancelSpeech();
                stopAllTonesNow();
                if (state.nextTimer) clearTimeout(state.nextTimer);
                state.nextTimer = null;
                state.question = null;
                hostEl.innerHTML = "";
                state.exerciseId = "";
                renderList();
                root.querySelector(".solfeo-hub")?.classList.remove("has-exercise");
                if (state.keyHandler) {
                    document.removeEventListener("keydown", state.keyHandler);
                    state.keyHandler = null;
                }
            });
        }

        if (diffSel) {
            diffSel.value = state.difficulty;
            diffSel.addEventListener("change", async () => {
                state.difficulty = diffSel.value || "medium";
                state.running = true;
                await nextRound();
            });
        }

        if (speedSel) {
            speedSel.value = String(state.modePlaybackRate);
            speedSel.addEventListener("change", async () => {
                const parsed = Number(speedSel.value);
                state.modePlaybackRate = Number.isFinite(parsed) ? parsed : 1;
                if (state.question && (ex.id === "scale_ear" || ex.id === "phrase_transcription")) {
                    await playCurrent();
                }
            });
        }

        if (unattendedModeSel && unattendedSupported) {
            unattendedModeSel.value = state.unattendedMode ? "on" : "off";
            unattendedModeSel.addEventListener("change", () => {
                state.unattendedMode = unattendedModeSel.value === "on";
                if (!state.unattendedMode) {
                    cancelSpeech();
                    if (state.nextTimer) clearTimeout(state.nextTimer);
                    state.nextTimer = null;
                    state.awaitingAnswer = true;
                    setFeedback("Modo siesta desactivado.");
                } else {
                    setFeedback("Modo siesta activado: la respuesta se dirá en audio y avanzará solo.");
                }
            });
        }

        if (unattendedGapSel && unattendedSupported) {
            unattendedGapSel.value = String(state.unattendedGapMs);
            unattendedGapSel.addEventListener("change", () => {
                const parsed = Number(unattendedGapSel.value);
                state.unattendedGapMs = Number.isFinite(parsed) ? parsed : 5000;
            });
        }

        if (state.keyHandler) {
            document.removeEventListener("keydown", state.keyHandler);
        }
        state.keyHandler = async (e) => {
            const tag = e.target && e.target.tagName ? e.target.tagName.toLowerCase() : "";
            if (tag === "input" || tag === "textarea" || tag === "select") return;
            if (/^[1-9]$/.test(e.key)) {
                const btn = options.querySelector(`.solfeo-option[data-idx='${e.key}']`);
                if (btn) btn.click();
            }
            if (e.key.toLowerCase() === "p") await playCurrent();
            if (e.key.toLowerCase() === "r") revealBtn.click();
            if (e.key.toLowerCase() === "n") nextBtn.click();
        };
        document.addEventListener("keydown", state.keyHandler);

        paintStats();
    };

    state.exerciseId = "";
    renderList();
    hostEl.innerHTML = "";
});

