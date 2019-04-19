/*
 * Copyright 2018 balena.io
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict'

const dhAPI = require('docker-hub-api')
const fs = require('fs-extra')
const handlebars = require('handlebars')
const path = require('path')
const utils = require('./utils')

const BALLENA_LIB_GH_URL = 'https://github.com/balena-io-library/base-images'
const DOCKERHUB_DESC_URL = 'https://raw.githubusercontent.com/balena-io-library/base-images/master/balena-base-images/docs/dockerhub/'
const SHORT_DESCRIPTION = 'This image is part of the balena.io base image series for IoT devices.'

//const DEVICE_LIST = ['raspberry-pi2', 'qemux86-64', 'beaglebone-black', 'intel-nuc', 'via-vab820-quad', 'zynq-xz702', 'odroid-c1', 'odroid-xu4', 'parallella', 'nitrogen6x', 'hummingboard', 'ts4900', 'colibri-imx6dl', 'apalis-imx6q', 'raspberrypi3', 'artik5', 'artik10', 'beaglebone-green-wifi', 'beaglebone-green', 'artik710', 'am571x-evm', 'up-board', 'kitra710', 'imx6ul-var-dart', 'kitra520', 'jetson-tx2', 'jetson-tx1', 'generic-aarch64', 'generic-armv7ahf', 'bananapi-m1-plus', 'orangepi-plus2', 'fincm3', 'artik533s', 'artik530', 'orbitty-tx2', 'spacely-tx2', 'revpi-core-3', 'asus-tinker-board-s', 'asus-tinker-board', 'var-som-mx6', 'nanopi-neo-air', 'imx7-var-som', 'beaglebone-pocket', 'intel-edison', 'qemux86', 'stem-x86-32', 'cybertan-ze250', 'iot2000', 'ts7700', 'raspberry-pi', 'imx8m-var-dart', 'cl-som-imx8']
const DEVICE_LIST = ['imx8m-var-dart', 'cl-som-imx8']
const ARCH_LIST = ['armv7hf', 'i386', 'amd64', 'aarch64', 'rpi', 'armv5e', 'i386-nlp']
const STACK_LIST = ['node', 'python', 'golang', 'openjdk']

var devices = DEVICE_LIST.concat(ARCH_LIST)
var imageNames = ['-debian', '-debian-node', '-debian-python', '-debian-golang', '-debian-openjdk']
imageNames = imageNames.concat(['-alpine', '-alpine-node', '-alpine-python', '-alpine-golang', '-alpine-openjdk'])
imageNames = imageNames.concat(['-fedora', '-fedora-node', '-fedora-python', '-fedora-golang', '-fedora-openjdk'])
imageNames = imageNames.concat(['-ubuntu', '-ubuntu-node', '-ubuntu-python', '-ubuntu-golang', '-ubuntu-openjdk'])

const dhAccount = process.env.DH_ACCOUNT
const dhPassword = process.env.DH_PASSWORD

var repoInfo = {}

dhAPI.setCacheOptions({enabled: true})
dhAPI.login(dhAccount, dhPassword)
.then(
  function (info) {
    for (const device of devices) {
      for (const imageName of imageNames) {

        repoInfo = {
          'namespace': 'balenalib',
          'device': device,
          'stackName': (imageName ? imageName : '-debian'),
          'imageName': device + (imageName ? imageName : '-debian')
        }

        var rawContent = execSync(`curl -sSL --compressed ${DOCKERHUB_DESC_URL + repoInfo.imageName}-full-description.md`).toString()
        if (!rawContent.includes('404: Not Found')) {
        } else {
          console.log(`Missing descriptions for ${repoInfo.imageName}!`)
          continue
        }

        repoInfo['descriptions'] = {
          'short': SHORT_DESCRIPTION,
          'full': rawContent
        }

        utils.setDockerhubDescription(info.token, repoInfo)
        if (repoInfo.stackName.includes('debian')) {
          repoInfo.imageName = repoInfo.imageName.replace(/-debian/, '')
          utils.setDockerhubDescription(info.token, repoInfo)
        }
      }
    }
  }
)
.catch (
  function (error) {
    console.log(error)
  }
)
