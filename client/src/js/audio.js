import { toFixedNumber } from './helpers'
import { notes, notesInit, pitchDetection } from './notes'
import { settings } from './settings'

export let audioContext = null
let squareWave = null
let sawtoothWave = null
let compressor = null

// Стандартные square и sawtooth осцилляторы слишком резко меняют свои значения,
// из-за чего возникают щелчки
// Этот баг фиксится через кастомные формы волн
const fourierCoefficients = {
  square: {
    real: [
      -0.36626994609832764,
      6.029391288757324,
      -0.19730372726917267,
      1.6619471311569214,
      -0.19724227488040924,
      1.3105599880218506,
      -0.1978960931301117,
      1.2136590480804443,
      -0.1982928365468979,
      1.173160195350647,
      -0.19904087483882904,
      1.151987910270691,
      -0.1997050791978836,
      1.138441801071167,
      -0.20070235431194305,
      1.1281323432922363,
      -0.2019263505935669,
      1.1190999746322632,
      -0.20291641354560852,
      1.1103429794311523,
      -0.2038358747959137,
      1.1008262634277344,
      -0.2046438753604889,
      1.090717077255249,
      -0.20541562139987946,
      1.0797215700149536,
      -0.20619842410087585,
      1.0680949687957764,
      -0.20637062191963196,
      1.055716872215271,
      -0.20673519372940063,
      1.0433330535888672,
      -0.20701037347316742,
      1.0309003591537476,
      -0.20660743117332458,
      1.0185457468032837,
      -0.205982968211174,
      1.0071656703948975,
      -0.20559249818325043,
      0.995996356010437,
      -0.20450708270072937,
      0.9865143895149231,
      -0.2038058489561081,
      0.9773967862129211,
      -0.20271623134613037,
      0.9703430533409119,
      -0.20159627497196198,
      0.9642654061317444,
      -0.20063833892345428,
      0.9593200087547302,
      -0.19978035986423492,
      0.9556630253791809,
      -0.19863766431808472,
      0.9527756571769714,
      -0.1979074627161026,
      0.9507238864898682,
      -0.1973714679479599,
      0.9496198296546936,
      -0.19705352187156677,
      0.9490557909011841,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
    ],
    imag: [
      0,
      61.61503982543945,
      -0.0070415339432656765,
      20.611003875732422,
      -0.003715433878824115,
      12.320550918579102,
      -0.003177450504153967,
      8.746326446533203,
      -0.002948831068351865,
      6.746776580810547,
      -0.002961810678243637,
      5.462915897369385,
      -0.002885965397581458,
      4.565426826477051,
      -0.0030379416421055794,
      3.8996381759643555,
      -0.0029344737995415926,
      3.3834776878356934,
      -0.0031999927014112473,
      2.9704341888427734,
      -0.0033238078467547894,
      2.630431890487671,
      -0.003493582597002387,
      2.3441388607025146,
      -0.0035432178992778063,
      2.0985631942749023,
      -0.003574345028027892,
      1.8846455812454224,
      -0.0035537832882255316,
      1.6950992345809937,
      -0.0035966038703918457,
      1.5251586437225342,
      -0.0035648683551698923,
      1.3712939023971558,
      -0.003324032761156559,
      1.2298352718353271,
      -0.003059905022382736,
      1.099546194076538,
      -0.002998646115884185,
      0.9782153964042664,
      -0.002375461161136627,
      0.864102840423584,
      -0.0023680778685957193,
      0.7568547129631042,
      -0.0022333727683871984,
      0.655020534992218,
      -0.0018261834047734737,
      0.5579419732093811,
      -0.0015898228157311678,
      0.4648510217666626,
      -0.0011751690180972219,
      0.3757583796977997,
      -0.000904021377209574,
      0.2892845571041107,
      -0.0009147493401542306,
      0.20495030283927917,
      -0.0003731999604497105,
      0.12234722077846527,
      0.00006776519876439124,
      0.04073695093393326,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
    ],
  },
  sawtooth: {
    real: [
      -0.2128259390592575,
      0.43020427227020264,
      -0.3802155554294586,
      0.39318570494651794,
      -0.3866429328918457,
      0.3911486864089966,
      -0.38942503929138184,
      0.3925042748451233,
      -0.3924199342727661,
      0.3953993022441864,
      -0.39608505368232727,
      0.39898601174354553,
      -0.40029671788215637,
      0.40276744961738586,
      -0.40471380949020386,
      0.40744227170944214,
      -0.40929925441741943,
      0.41191843152046204,
      -0.41422832012176514,
      0.41683557629585266,
      -0.4191102087497711,
      0.42197152972221375,
      -0.42425692081451416,
      0.42680537700653076,
      -0.4291529059410095,
      0.43171635270118713,
      -0.43399283289909363,
      0.4365193843841553,
      -0.43843600153923035,
      0.44087883830070496,
      -0.4428611397743225,
      0.4448528289794922,
      -0.4468531012535095,
      0.44867464900016785,
      -0.45029324293136597,
      0.45193761587142944,
      -0.4536658525466919,
      0.45539727807044983,
      -0.45665937662124634,
      0.4575652480125427,
      -0.45892730355262756,
      0.45996278524398804,
      -0.46089065074920654,
      0.4617873430252075,
      -0.4625128507614136,
      0.46289584040641785,
      -0.4634133279323578,
      0.4640624523162842,
      -0.46411240100860596,
      0.4642360806465149,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
    ],
    imag: [
      0,
      40.303253173828125,
      -15.415637969970703,
      11.028034210205078,
      -7.9055070877075195,
      6.439881324768066,
      -5.254321575164795,
      4.5257697105407715,
      -3.900256395339966,
      3.4624736309051514,
      -3.0736374855041504,
      2.7797441482543945,
      -2.5129919052124023,
      2.300569534301758,
      -2.104926824569702,
      1.9431331157684326,
      -1.7928383350372314,
      1.6648855209350586,
      -1.5446336269378662,
      1.4402865171432495,
      -1.3418267965316772,
      1.2545875310897827,
      -1.1717488765716553,
      1.0972166061401367,
      -1.0264544486999512,
      0.9616853594779968,
      -0.8999052047729492,
      0.843029260635376,
      -0.7885620594024658,
      0.7378413677215576,
      -0.6889731884002686,
      0.6428762674331665,
      -0.5986546874046326,
      0.5569077730178833,
      -0.5164836645126343,
      0.477679044008255,
      -0.4402264356613159,
      0.4043141007423401,
      -0.3690325915813446,
      0.33509474992752075,
      -0.3017183244228363,
      0.26975053548812866,
      -0.23788419365882874,
      0.20691440999507904,
      -0.1764654815196991,
      0.14642955362796783,
      -0.11661481112241745,
      0.08744602650403976,
      -0.05802077800035477,
      0.02892916277050972,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
    ],
  },
}

export function audioInit() {
  // // Проверяем поддержку контекста браузером
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  } catch (error) {
    window.alert(`Браузер не поддерживается / Browser is not support`)
  }

  squareWave = audioContext.createPeriodicWave(Float32Array.from(fourierCoefficients.square.real), Float32Array.from(fourierCoefficients.square.imag))
  sawtoothWave = audioContext.createPeriodicWave(Float32Array.from(fourierCoefficients.sawtooth.real), Float32Array.from(fourierCoefficients.sawtooth.imag))

  // Все осцилляторы будут подключаться к одному компрессору
  compressor = audioContext.createDynamicsCompressor()
  compressor.connect(audioContext.destination)
}

// Определяем массив нот в рамках равномерной темперации
notesInit()

// Генерируемая частота звука и html-элемент, куда будем её записывать
let frequency = null
let previousFrequency = null // Для более эффективной работы с обновлением DOM
const frequencyElement = document.querySelector('.motion__frequency')

const countElement = document.querySelector('.motion__count') // Количество осцилляторов
const containerElement = document.querySelector('.container') // body для анимирования по сбросу осцилляторов

let oscillatorArray = [] // Массив осцилляторов
let biquadFilterArray = [] // Массив фильтров
let LFOArray = [] // Массив осцилляторов
let LFOGainArray = [] // Массив фильтров
let envelopeArray = [] // Массив ручек громкости, реализующих огибающую (envelope)
let masterGainArray = [] // Ручка громкости, управляемая LFO
let motionIsOff = true // Маркер последнего события движения

// Для кнопки очистки осцилляторов
// Массив таймаутов в конце функции audio(), по которым очищаются массивы
let motionTimeoutArray = []
// Для 2ух-секундной блокировки интерфеса
// (функционально в этом нет особого смысла, но для UX это создаёт впечатление перезапуска системы)
let interfaceIsBlocked = false

// Таймаут срабатывания системы
let audioTimeoutIsOff = true

// Кнопка очистки осцилляторов
document.querySelector('.off').addEventListener('change', function () {
  containerElement.classList.add('inactive')

  motionIsOff = true // Заканчиваем последнее движение
  interfaceIsBlocked = true // Блокируем интерфейс

  // Очищаем таймауты в конце функции audio()
  motionTimeoutArray.forEach((timeout) => {
    clearTimeout(timeout)
  })

  // Останавливаем осцилляторы
  oscillatorArray.forEach((oscillator) => {
    oscillator.stop()
  })

  // Очищаем систему от всех элементов графа
  oscillatorArray.length = 0
  biquadFilterArray.length = 0
  envelopeArray.length = 0

  if (settings.audio.LFO.enabled) {
    LFOArray.length = 0
    LFOGainArray.length = 0
    masterGainArray.length = 0
  }

  // Отображаем обнулённый счётчик осцилляторов
  settings.ui.lite ? false : (countElement.textContent = oscillatorArray.length)

  // Приводим интерфейс в исходную
  setTimeout(() => {
    containerElement.classList.remove('inactive')
    this.querySelector('#off').checked = false
    interfaceIsBlocked = false
  }, 2000)
})

// Граф - это осциллятор => фильтр => громкость
// Событие движения - js-событие, генерируемое каждые 16мс смартфоном, содержащее параметры движения
// События возникают даже в состоянии покоя - в этом случае параметры движения нулевые
// Отсечка - минимальная скорость движения, при которой заводится система
// Жест - набор событий движения от превышения отсечки до значения ниже отсечки
// Каждому жесту соответствует свой осциллятор

// У нас есть массив осцилляторов (вернее массивы элементов-узлов графа)
// При превышении отсечки мы можем сказать, что движение началось
// При скорости ниже отсечки мы можем сказать, что движение закончилось,
// отследив что это последнее событие движения в череде событий с помощью маркера motionIsOff.

// Функция обновляет параметры компрессора
export function updateCompressorSettings({ threshold, knee, ratio, attack, release }) {
  compressor.threshold.setValueAtTime(threshold, audioContext.currentTime)
  compressor.knee.setValueAtTime(knee, audioContext.currentTime)
  compressor.ratio.setValueAtTime(ratio, audioContext.currentTime)
  compressor.attack.setValueAtTime(attack, audioContext.currentTime)
  compressor.release.setValueAtTime(release, audioContext.currentTime)
}

let previousMotionMaximum = 0

// Управление громкостью
function setGain(motionMaximum) {
  if (settings.audio.attack) {
    envelopeArray[envelopeArray.length - 1].gain.linearRampToValueAtTime(settings.audio.gain, audioContext.currentTime + settings.audio.attack)
  } else if (settings.motion.gainGeneration === true) {
    envelopeArray[envelopeArray.length - 1].gain.setTargetAtTime((motionMaximum - settings.motion.threshold + 1) * settings.audio.gain, audioContext.currentTime, 0.005)
  } else {
    envelopeArray[envelopeArray.length - 1].gain.setTargetAtTime(settings.audio.gain, audioContext.currentTime, 0.005)
  }
}

// Функция вызывается ≈ каждые 16мс (в Chrome, в Firefox раз в 100мс)
export function audio(motion) {
  // Определяем частоту и ноту
  // Делаем это даже ниже отсечки, чтобы можно было попасть в нужную ноту
  // до начала синтеза звука
  if (settings.audio.frequencyRegime === 'continuous') {
    // Экспоненциально - градусы положения в степени log диапазона (разницы значений) по основанию 180 (максимальное значение гироскопа) + минимальное значение
    frequency = toFixedNumber(Math.pow(motion.orientation, Math.log(settings.audio.frequenciesRange.to - settings.audio.frequenciesRange.from) / Math.log(180)) + settings.audio.frequenciesRange.from, 4)
  }
  if (settings.audio.frequencyRegime === 'tempered') {
    // Начиная с from в звукоряде наверх (to - from) нот по 180 градусам распределяем
    frequency = notes[settings.audio.notesRange.from + Math.floor(motion.orientation * ((settings.audio.notesRange.to - settings.audio.notesRange.from) / 180))]
  }

  // Обновляем DOM только при изменении значения
  if (previousFrequency !== frequency) {
    settings.ui.lite ? false : (frequencyElement.textContent = frequency)
    previousFrequency = frequency
  }

  // Переводим частоту в ноту
  pitchDetection(frequency)

  // Отсечка превышена - движение началось
  if (motion.isMotion && !interfaceIsBlocked && audioTimeoutIsOff) {
    // Собираем граф, делаем это только один раз в начале движения
    if (motionIsOff) {
      motionIsOff = false

      oscillatorArray.push(audioContext.createOscillator())
      biquadFilterArray.push(audioContext.createBiquadFilter())
      envelopeArray.push(audioContext.createGain())

      oscillatorArray[oscillatorArray.length - 1].connect(biquadFilterArray[biquadFilterArray.length - 1])
      biquadFilterArray[biquadFilterArray.length - 1].connect(envelopeArray[envelopeArray.length - 1])

      oscillatorArray[oscillatorArray.length - 1].type = settings.audio.oscillatorType
      biquadFilterArray[biquadFilterArray.length - 1].type = 'lowpass'
      biquadFilterArray[biquadFilterArray.length - 1].Q.value = settings.audio.biquadFilterQ
      biquadFilterArray[biquadFilterArray.length - 1].frequency.value = settings.audio.biquadFilterFrequency

      if (settings.audio.LFO.enabled) {
        LFOArray.push(audioContext.createOscillator())
        LFOGainArray.push(audioContext.createGain())
        masterGainArray.push(audioContext.createGain())

        LFOArray[LFOArray.length - 1].connect(LFOGainArray[LFOGainArray.length - 1])
        LFOGainArray[LFOGainArray.length - 1].connect(masterGainArray[masterGainArray.length - 1].gain)
        envelopeArray[envelopeArray.length - 1].connect(masterGainArray[masterGainArray.length - 1])
        masterGainArray[masterGainArray.length - 1].connect(compressor)

        if (settings.audio.LFO.type === 'square') {
          LFOArray[LFOArray.length - 1].setPeriodicWave(squareWave)
        } else if (settings.audio.LFO.type === 'sawtooth') {
          LFOArray[LFOArray.length - 1].setPeriodicWave(sawtoothWave)
        } else {
          LFOArray[LFOArray.length - 1].type = settings.audio.LFO.type
        }

        LFOArray[LFOArray.length - 1].frequency.value = settings.audio.LFO.rate // Сколько раз в секунду изменяется значение
        LFOGainArray[LFOGainArray.length - 1].gain.value = settings.audio.LFO.depth // Регулятор силы изменения от 0 до 1

        LFOArray[LFOArray.length - 1].start()
      } else {
        envelopeArray[envelopeArray.length - 1].connect(compressor)
      }

      // Изначальная громкость минимальна
      envelopeArray[envelopeArray.length - 1].gain.setValueAtTime(0, audioContext.currentTime)

      oscillatorArray[oscillatorArray.length - 1].start()

      settings.ui.lite ? false : (countElement.textContent = oscillatorArray.length)
    }

    // Здесь во время движения мы управляем поведением последнего собранного графа (length - 1 это последний элемент массивов)
    // Динамически настраиваем граф - он обновляется по каждому событию движения
    oscillatorArray[oscillatorArray.length - 1].frequency.value = frequency

    // Режим отсечки не полный
    if (settings.motion.thresholdType !== 'full') {
      // Каждый жест в конце своего движения замедляется
      // Это приводит к тому, что середина звука может быть громкой, а конец очень тихим
      // Мы можем поймать замедление движения и интерпретировать как конец жеста
      // Тогда осциллятор будет обрываться на пике скорости

      // Как только движение замедлится, поднять флаги и отключить осциллятор
      if (motion.maximum <= previousMotionMaximum) {
        motionIsOff = false
        audioTimeoutIsOff = false
      } else {
        previousMotionMaximum = motion.maximum
      }
    } else {
      setGain(motion.maximum) // Включаем звук
    }

    if (oscillatorArray.length >= 120) countElement.classList.add('warning')
  }
  // Если оказались ниже отсечки, а до этого были выше (motionIsOff === false),
  // значит мы поймали последнее событие движения (движение остановлено).
  // Тогда планируем затухание сигнала и удаление графа
  else if (!motionIsOff) {
    motionIsOff = true // Движение закончено
    audioTimeoutIsOff = false // Ставим таймаут от случайных движений после этого

    if (settings.motion.thresholdType !== 'full') {
      setGain(previousMotionMaximum) // Включаем звук
      previousMotionMaximum = 0
    }

    const end = audioContext.currentTime + settings.audio.release + settings.audio.attack + 0.01

    // Планируем затухание громкости и остановку осциллятора
    // последних элементов в массивах на момент остановки движения
    // +10мс чтобы успеть setTargetAtTime в setGain()
    setTimeout(() => {
      envelopeArray[envelopeArray.length - 1].gain.exponentialRampToValueAtTime(settings.audio.attenuation, end)
    }, 10)

    // + 0.1 это время полного погашения громкости на setTargetAtTime с запасом
    if (settings.audio.LFO.enabled) LFOArray[LFOArray.length - 1].stop(end)
    oscillatorArray[oscillatorArray.length - 1].stop(end)

    // Планируем удаление этих элементов, они будут первыми с массивах
    // на момент вызова таймаута
    motionTimeoutArray.push(
      setTimeout(() => {
        oscillatorArray.shift()
        biquadFilterArray.shift()
        envelopeArray.shift()

        if (settings.audio.LFO.enabled) {
          LFOArray.shift()
          LFOGainArray.shift()
          masterGainArray.shift()
        }

        settings.ui.lite ? false : (countElement.textContent = oscillatorArray.length)
        if (oscillatorArray.length < 120) countElement.classList.remove('warning')
      }, (settings.audio.release + settings.audio.attack) * 1000)
    )

    setTimeout(() => {
      audioTimeoutIsOff = true
    }, settings.motion.timeout)
  }
}
