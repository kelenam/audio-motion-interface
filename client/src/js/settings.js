// Здесь инициализируется объект настроек
// Он изменяется через мутации
// Мутации запускаются по событиям интерфейса управления
// и синхронизируют настройки по вебсокету с удалённым десктопом

import { socketInit, socketIsInit, socket } from './websocket'

// Элементы настроек
let durationElement = null
let attenuationElement = null
let frequenciesRangeElement = null
let notesRangeElement = null
let synthesisRegimeElement = null
let oscillatorRegimeElement = null
let frequencyRegimeElement = null
let thresholdElement = null
let waveElement = null
let filterElement = null
let gainElement = null
let countContainerElement = null

window.addEventListener('DOMContentLoaded', () => {
  synthesisRegimeElement = document.querySelector('.synthesis-regime')
  oscillatorRegimeElement = document.querySelector('.oscillator-regime')
  frequencyRegimeElement = document.querySelector('.frequency-regime')
  thresholdElement = document.querySelector('.threshold')
  waveElement = document.querySelector('.wave')
  filterElement = document.querySelector('.filter')
  gainElement = document.querySelector('.gain')
  durationElement = document.querySelector('.duration-container')
  attenuationElement = document.querySelector('.attenuation-container')
  frequenciesRangeElement = document.querySelector('.frequencies-range')
  notesRangeElement = document.querySelector('.notes-range')
  countContainerElement = document.querySelector('.motion__count-container')

  // Так как при инициализации у нас single-режим и непрерывный режим, то можно сразу убрать элементы
  durationElement.style.display = 'none'
  attenuationElement.style.display = 'none'
  notesRangeElement.style.display = 'none'
  countContainerElement.style.display = 'none'
})

// Функция синхронизирует настройки со смартфона с десктопом
function syncSettings() {
  if (socketIsInit) {
    socket.emit('settings message', settings)
  }
}

// Функция обновляет input-поля в соответствии с пришедшим объектом настроек
export function syncSettingsFrontend(settings) {
  if (settings.audio.oscillatorRegime === 'single') {
    document.querySelector('#single').checked = true
    durationElement.style.display = 'none'
    attenuationElement.style.display = 'none'
  }
  if (settings.audio.oscillatorRegime === 'plural') {
    document.querySelector('#plural').checked = true
    durationElement.style.display = 'flex'
    attenuationElement.style.display = 'flex'
  }
  if (settings.audio.frequencyRegime === 'continuous') {
    document.querySelector('#continuous').checked = true
    frequenciesRangeElement.style.display = 'flex'
    notesRangeElement.style.display = 'none'
  }
  if (settings.audio.frequencyRegime === 'tempered') {
    document.querySelector('#tempered').checked = true
    frequenciesRangeElement.style.display = 'none'
    notesRangeElement.style.display = 'flex'
  }
  frequenciesRangeElement.querySelector('.frequencies-range-from').value = settings.audio.frequenciesRange.from
  frequenciesRangeElement.querySelector('.frequencies-range-to').value = settings.audio.frequenciesRange.to
  notesRangeElement.querySelector('.notes-range-from').value = settings.audio.notesRange.from
  notesRangeElement.querySelector('.notes-range-to').value = settings.audio.notesRange.to
  thresholdElement.value = settings.motion.threshold
  waveElement.value = settings.audio.oscillatorType
  filterElement.value = settings.audio.biquadFilterFrequency
  gainElement.value = settings.audio.gain
  durationElement.querySelector('.duration').value = settings.audio.toneDuration
  attenuationElement.querySelector('.attenuation').value = settings.audio.attenuation
}

// Настройки системы
export let settings = {
  motion: {
    threshold: 1.0,
  },
  audio: {
    toneDuration: 1.2,
    oscillatorType: 'sine',
    biquadFilterFrequency: 600.0,
    attenuation: 0.0001,
    gain: 0.08,
    synthesisRegime: 'local',
    oscillatorRegime: 'single',
    frequencyRegime: 'continuous',
    frequenciesRange: {
      from: 0.0,
      to: 600.0,
    },
    notesRange: {
      from: 48,
      to: 60,
    },
  },
}

// Мутации
export const mutations = {
  motion: {
    setThreshold: (threshold) => {
      settings.motion.threshold = threshold
      syncSettings()
    },
  },
  audio: {
    setWaveType: (waveType) => {
      settings.audio.oscillatorType = String(waveType)
      syncSettings()
    },
    setDuration: (duration) => {
      settings.audio.toneDuration = duration
      syncSettings()
    },
    setBiquadFilterFrequency: (biquadFilterFrequency) => {
      settings.audio.biquadFilterFrequency = biquadFilterFrequency
      syncSettings()
    },
    setAttenuation: (attenuation) => {
      settings.audio.attenuation = attenuation
      syncSettings()
    },
    setGain: (gain) => {
      settings.audio.gain = gain
      syncSettings()
    },
    setSynthesisRegime: (synthesisRegime) => {
      settings.audio.synthesisRegime = synthesisRegime

      if (settings.audio.synthesisRegime === 'local') {
        socket.disconnect()
      }
      if (settings.audio.synthesisRegime === 'remote') {
        socket.connect()
      }
    },
    setOscillatorRegime: (oscillatorRegime) => {
      settings.audio.oscillatorRegime = oscillatorRegime

      if (oscillatorRegime === 'single') {
        durationElement.style.display = 'none'
        attenuationElement.style.display = 'none'
        countContainerElement.style.display = 'none'
      }
      if (oscillatorRegime === 'plural') {
        durationElement.style.display = 'flex'
        attenuationElement.style.display = 'flex'
        countContainerElement.style.display = 'flex'
      }

      syncSettings()
    },
    setFrequencyRegime: (frequencyRegime) => {
      settings.audio.frequencyRegime = frequencyRegime

      if (frequencyRegime === 'continuous') {
        frequenciesRangeElement.style.display = 'flex'
        notesRangeElement.style.display = 'none'
      }
      if (frequencyRegime === 'tempered') {
        frequenciesRangeElement.style.display = 'none'
        notesRangeElement.style.display = 'flex'
      }

      syncSettings()
    },

    setFrequencyRange: (rangeType, frequency) => {
      if (rangeType === 'from') {
        settings.audio.frequenciesRange.from = frequency
      }
      if (rangeType === 'to') {
        settings.audio.frequenciesRange.to = frequency
      }

      syncSettings()
    },

    setNoteRange: (rangeType, note) => {
      if (rangeType === 'from') {
        settings.audio.notesRange.from = note
      }
      if (rangeType === 'to') {
        settings.audio.notesRange.to = note
      }

      syncSettings()
    },
  },
}

// Связываем объект настроек с интерфейсом управления
export function settingsInit() {
  // Включение веб-сокета на смартфоне
  synthesisRegimeElement.addEventListener('change', function (event) {
    if (!socketIsInit) {
      socketInit()

      socket.connect()

      // По обновлению объекта настроек
      socket.on('settings message', (settingsData) => {
        Object.assign(settings, settingsData) // Обновляем объект
        syncSettingsFrontend(settingsData) // Обновляем input-поля
      })
    }

    mutations.audio.setSynthesisRegime(event.target.value)
  })

  oscillatorRegimeElement.addEventListener('change', function (event) {
    mutations.audio.setOscillatorRegime(event.target.value)
  })

  frequencyRegimeElement.addEventListener('change', function (event) {
    mutations.audio.setFrequencyRegime(event.target.value)
  })

  thresholdElement.addEventListener('input', function () {
    mutations.motion.setThreshold(parseFloat(this.value))
  })

  frequenciesRangeElement.addEventListener('input', function (event) {
    if (event.target.classList[0] === 'frequencies-range-from') {
      mutations.audio.setFrequencyRange('from', parseFloat(event.target.value))
    }
    if (event.target.classList[0] === 'frequencies-range-to') {
      mutations.audio.setFrequencyRange('to', parseFloat(event.target.value))
    }
  })

  notesRangeElement.addEventListener('input', function (event) {
    if (event.target.classList[0] === 'notes-range-from') {
      mutations.audio.setNoteRange('from', parseFloat(event.target.value))
    }
    if (event.target.classList[0] === 'notes-range-to') {
      mutations.audio.setNoteRange('to', parseFloat(event.target.value))
    }
  })

  waveElement.addEventListener('change', function () {
    mutations.audio.setWaveType(this.options[this.selectedIndex].text)
  })

  durationElement.addEventListener('input', function (event) {
    mutations.audio.setDuration(parseFloat(event.target.value))
  })

  filterElement.addEventListener('input', function () {
    mutations.audio.setBiquadFilterFrequency(parseFloat(this.value))
  })

  attenuationElement.addEventListener('input', function (event) {
    mutations.audio.setAttenuation(parseFloat(event.target.value))
  })

  gainElement.addEventListener('input', function () {
    mutations.audio.setGain(parseFloat(this.value))
  })

  // Заполняем интерфейс дефолтными данными
  syncSettingsFrontend(settings)
}
