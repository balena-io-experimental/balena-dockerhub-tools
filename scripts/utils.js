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
const { execSync } = require('child_process');

const OFFICIAL_IMAGES_REPO_URL = 'https://raw.githubusercontent.com/balena-io-library/official-images/master/library/'

/**
 * @module utils
 */

/**
 * @summary Set short and full description for a Dockerhub repository
 * @function
 * @memberof module:utils
 * @public
 *
 * @param {String} token - Dockerhub login token
 * @param {Dictionary} repoInfo - Dockerhub repository information
 *
 * @example
 */
exports.setDockerhubDescription = (token, repoInfo) => {

  dhAPI.setLoginToken(token)
  dhAPI.setRepositoryDescription(repoInfo.namespace, repoInfo.imageName, repoInfo.descriptions)
  .then (((info) => {
    console.log(`${info.user}/${info.name} updated successfully!`)
  }))
  .catch ((error) => {
    console.log(`${repoInfo.imageName} error!`)
  })
}

/**
 * @summary Download and extract tags for dockerhub full description from library file from balena-io-library/official-image repo
 * @function
 * @memberof module:utils
 * @public
 *
 * @param {String} repo - library file name
 *
 * @example
 */

exports.getAllRepoTags = (repo) => {
  var rawContent = execSync(`curl -sSL --compressed ${OFFICIAL_IMAGES_REPO_URL + repo}`).toString()
  var parsedContent = {}

  if (!rawContent.includes('404: Not Found')) {
    rawContent = rawContent.split(/(?:\r\n|\r|\n)/g).filter(n => n)
    for (const line of rawContent) {
      if (line.startsWith('#')) {
        // skip comment line
        continue
      }
      // line example: `edge-build-20181029: git://github.com/balena-io-library/base-images@1d433d7f9167c09038f1476a24ab3c71253229bc balena-base-images/node/aarch64/alpine/edge/10.10.0/build`
      var tmp = line.split(' ')
      parsedContent[tmp[2]] = (parsedContent[tmp[2]] ? parsedContent[tmp[2]].concat([`\`${tmp[0].slice(0, -1)}\``]) : [`\`${tmp[0].slice(0, -1)}\``])
    }
    let tags = ''
    for (const item of Object.keys(parsedContent)) {
      // something like: `[`jessie`, `latest` (*debian/armv7hf/jessie/Dockerfile*)](https://github.com/balena-io-library/base-images/tree/master/debian/armv7hf/jessie/Dockerfile)`
      tags += `[${parsedContent[item].join(', ')} (*${item}*)](https://github.com/balena-io-library/base-images/tree/master/${item}/Dockerfile)\n\n`
    }
    return tags
  }
}
