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
