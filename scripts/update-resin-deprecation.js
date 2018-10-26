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
const path = require('path')

var devices = ['raspberry-pi2', 'qemux86-64', 'beaglebone-black', 'intel-nuc', 'via-vab820-quad', 'zynq-xz702', 'odroid-c1', 'odroid-xu4', 'parallella', 'nitrogen6x', 'hummingboard', 'ts4900', 'colibri-imx6dl', 'apalis-imx6q', 'raspberrypi3', 'artik5', 'artik10', 'beaglebone-green-wifi', 'beaglebone-green', 'artik710', 'am571x-evm', 'up-board', 'kitra710', 'imx6ul-var-dart', 'kitra520', 'jetson-tx2', 'jetson-tx1', 'generic-aarch64', 'generic-armv7ahf', 'bananapi-m1-plus', 'orangepi-plus2', 'fincm3', 'artik533s', 'artik530', 'orbitty-tx2', 'spacely-tx2', 'revpi-core-3', 'asus-tinker-board-s', 'asus-tinker-board', 'intel-edison', 'qemux86', 'stem-x86-32', 'cybertan-ze250', 'iot2000', 'ts7700', 'raspberry-pi']
devices = devices.concat(['armv7hf', 'armel', 'i386', 'amd64', 'aarch64', 'rpi', 'armhf'])

var imageNames = ['-debian', '-buildpack-deps', '-node', '-python', '-golang', '-openjdk']
imageNames = imageNames.concat(['-alpine', '-alpine-buildpack-deps', '-alpine-node', '-alpine-python', '-alpine-golang', '-alpine-openjdk'])
imageNames = imageNames.concat(['-fedora', '-fedora-buildpack-deps', '-fedora-node', '-fedora-python', '-fedora-golang', '-fedora-openjdk'])
imageNames = imageNames.concat(['-ubuntu', '-ubuntu-buildpack-deps', '-ubuntu-node', '-ubuntu-python', '-ubuntu-golang', '-ubuntu-openjdk'])

const dhAccount = process.env.DH_ACCOUNT
const dhPassword = process.env.DH_PASSWORD

const descriptions = {
	short: fs.readFileSync(path.join(__dirname, '../template-helpers/resin-short-deprecation.tpl'), 'utf8'),
	full: fs.readFileSync(path.join(__dirname, '../template-helpers/resin-full-deprecation.tpl'), 'utf8')
}

dhAPI.setCacheOptions({enabled: true})
dhAPI.login(dhAccount, dhPassword)
.then(
	function (info) {
		for (const device of devices) {
			for (const imageName of imageNames) {
				dhAPI.setRepositoryDescription('resin', device + imageName, descriptions)
				.then (((info) => {
					console.log(`${info.user}/${info.name} updated successfully!`)
				}))
				.catch ((error) => {
					console.log(`${device}${imageName} error!`)
				})
			}
		}
	}
)
.catch (
	function (error) {
		console.log(error)
	}
)
