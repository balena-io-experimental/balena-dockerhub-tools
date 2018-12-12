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
    // If the full description is over 25k characters then it will fail!
    if (!info.user) {
      console.log('Over 25k: ' + repoInfo.imageName)
    }
  }))
  .catch ((error) => {
    console.log(`Can't set ${repoInfo.imageName}!`)
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
      // line example: `{"tag":"edge-build-20181207","repoDir":"git://github.com/balena-io-library/base-images@03a5733bc082420e3186d3c89e2805923b0ba40b balena-base-images/aarch64/alpine/edge/build","alias":"edge-build-20181207 edge-build"}`
      try {
          var tmpObj = JSON.parse(line)
          parsedContent[tmpObj.repoDir.split(' ')[1]] = tmpObj.alias.split(' ')
      }
      catch (error) {
        console.log(`Error when reading ${repo} library file!`)
        continue
      }
    }
    let tags = ''
    for (const item of Object.keys(parsedContent)) {
      // something like: `[`jessie`, `latest` (*debian/armv7hf/jessie/Dockerfile*)](https://github.com/balena-io-library/base-images/tree/master/debian/armv7hf/jessie/Dockerfile)`
      tags += `[${parsedContent[item].join(', ')} (Dockerfile)](https://github.com/balena-io-library/base-images/tree/master/${item}/Dockerfile)\n\n`
    }
    return tags
  }
}
