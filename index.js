/* 
Copyright (C) 2016 Jason Lin infwonder<AT>gmail<DOT>com

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

'use strict';

const fs = require('fs');
const C = require('crypto');
const os = require('os');
const utils = require('evenly-utils');
const xrange = require('xrange');

// Currently, Evenly is only planned to run on Linux platform.

module.exports = 
{
  hostname: os.hostname(),
  cfgdir: os.homedir(),
  cfgpath: module.exports.cfgdir + '/.evenly.json', // A hidden file under user's homedir?? Really?? (WIP to change this...)
  configs: undefined,
  hostlist: undefined,
  hashs: undefined,
  chunked_hashs: undefined,
  nodeparts: {},

  load_config: function()
  {
    module.exports.configs = JSON.parse(fs.readFileSync(module.exports.cfgpath)); // synchronous operation... but it has to be this way anyway. 
    module.exports.hostlist = Object.keys(module.exports.configs.members);

    var level = module.exports.configs.ringsize;

    module.exports.hashs = utils.bucketmap(level);
    var bucketids = Object.keys(module.exports.hashs).map( (k) => {return module.exports.hashs[k]} )
    module.exports.chunked_hashs = utils.array_groups(bucketids, module.exports.hostlist.length);
    xrange(0, module.exports.hostlist.length).map( (i) => { module.exports.nodeparts[ module.exports.hostlist[i] ] = module.exports.chunked_hashs[i] } );
  },

  dump_screen: function()
  {
    console.log("* Evenly main config: (" + module.exports.cfgpath + ")");
    console.log(module.exports.configs); 
    console.log();
    console.log("* Evenly node parts: (Level = " + module.exports.configs.replevel + ")");
    Object.keys(module.exports.nodeparts).map( (i) => {
      console.log("-- Hostname: " + i + ", (" + module.exports.nodeparts[i].length + ")");
      console.log(module.exports.nodeparts[i]);
    });
  }
};
