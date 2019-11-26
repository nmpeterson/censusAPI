function selectBlockRatio(data, geo, geoRatio, inGeo) {
  var obj = new Object()
  for (var i = 0; i < data.length; i++) {

    if (inGeo.includes(data[i].BLOCK.toString())) {

      obj[data[i]["BLOCK"]] = {
        GEO: data[i][geo],
        POP_RAT: data[i][geoRatio + '_POP_RAT'],
        HH_RAT: data[i][geoRatio + '_HH_RAT'],
        HU_RAT: data[i][geoRatio + '_HU_RAT']
      }
    }
  }
  return obj
}
//push census values to censusObj with GEOID as key (tract)
function createCensusObj(json) {
  var obj = new Object()
  for (var i = 0; i < json.length; i++) {
    var GEOID = json[i]["GEO_ID"].split("US")[1]
    obj[GEOID] = json[i]
  }
  return obj
}

function allocCensusData(json, csv, geo, geoRatio, inGeo, tableName) {
  console.log(tableName)
  var excludeList = ["block-group", "tract", "county", "state", "GEO_ID", "NAME"]
  var allocatedValues = new Object();
  var tableValues = new Object();
  var allocatedObj = []
  var ratioObj, censusObj;
  var censusObjKeys = Object.keys(json[1])

  d3.csv(csv, function(data) {

    ratioObj = selectBlockRatio(data, geo, geoRatio, inGeo)
    console.log(ratioObj)
    censusObj = createCensusObj(json)
    console.log(censusObj)
    tableColumns = [];
    //tableData = [];
    Object.keys(json[1]).forEach(function(censusField) {
      var attr = censusField
      if ((!excludeList.includes(attr)) && attr.endsWith("E")) {
        //allocatedValues["NAME"] = 'Custom Area';
        //allocatedValues[censusField] = 0;
        tableValues[censusField] = 0;
        tableColumns.push(attr)
      }
    })

    allocatedValues[tableName] = tableColumns

    Object.keys(ratioObj).forEach(function(block) {
      Object.keys(json[1]).forEach(function(censusField) {
        //attr = list includes list of geographic attributes to exclude from allocation
        if ((!excludeList.includes(censusField)) && censusField.endsWith("E") && !isNaN(censusObj[ratioObj[block]["GEO"]][censusField])) {
          //add correct ratio application based on variable name
          tableValues[censusField] += Math.round(parseFloat(censusObj[ratioObj[block]["GEO"]][censusField]) * parseFloat(ratioObj[block]["POP_RAT"]))
          //allocSum += Math.round(parseFloat(censusObj[ratioObj[block]["BLKGRP"]][censusField]) * parseFloat(ratioObj[block]["BG_POP_RAT"]))
        }
      });
    });
    //console.log(tableValues)
    //tableData.push(Object.values(tableValues))
    allocatedValues['Count'] = Object.values(tableValues)
    console.log(allocatedValues)
    allocatedObj.push(allocatedValues)

    document.getElementById('dvData').innerHTML += json2table(allocatedObj, tableName)
  })

  return new Promise(resolve => {
    setTimeout(() => {
      resolve(allocatedObj);
    }, 300);
  });
}

function censusCounty(censusType, vintage, stateCodes, countyCodes, tables) {

  //Remove existing table to replaced with data selection
  var element = document.getElementsByTagName("Table"),
    index;

  for (index = element.length - 1; index >= 0; index--) {
    element[index].parentNode.removeChild(element[index]);
  }

  function censusPromise(args) {
    return new Promise(function(resolve, reject) {
      census(args, function(err, json) {
        if (!err) {
          resolve(json);
        } else {
          reject(err);
        }
      });
    });
  }

  var tableType;

  function getTable(i) {

    if (i.startsWith('S')) {
      tableType = 'subject'
    } else if ((i.startsWith('B')) || (i.startsWith('C'))) {
      tableType = ''
    } else if (i.startsWith('D')) {
      tableType = 'profile'
    }

    if (censusType.startsWith("acs")) {
      src = "acs"
    } else if (censusType.startsWith("dec")) {
      src = "dec"
    }

    censusParams = {
      vintage: vintage, // required
      geoHierarchy: {
        // required
        state: stateCodes,
        county: countyCodes
      },
      //cant make call for data and geojson at the same time
      //geoResolution: "5m",
      sourcePath: [src, censusType, tableType], // required
      //sourcePath: ["acs", "acs5"],
      values: ["NAME", "group(" + i + ")"], // required
      statsKey: "7d28d36d1b0595e1faf3c7c56ed6df8f4def1452" // required for > 500 calls per day
    }

    return censusPromise(censusParams).then(function(json) {
        return json
      })
      .then(function(json) {
        return json
      })
  }

  for (let i = 0; i < tables.length; i++) {
    getTable(tables[i]).then(function(r) {
      //console.log(r)
      document.getElementById('dvData').innerHTML += json2table(r)
    })
  }
}

function censusMuni(censusType, vintage, stateCodes, muniCodes, tables) {

  //Remove existing table to replaced with data selection
  var element = document.getElementsByTagName("Table"),
    index;

  for (index = element.length - 1; index >= 0; index--) {
    element[index].parentNode.removeChild(element[index]);
  }

  function censusPromise(args) {
    return new Promise(function(resolve, reject) {
      census(args, function(err, json) {
        if (!err) {
          resolve(json);
        } else {
          reject(err);
        }
      });
    });
  }

  var tableType;

  function getTable(i) {

    if (i.startsWith('S')) {
      tableType = 'subject'
    } else if ((i.startsWith('B')) || (i.startsWith('C'))) {
      tableType = ''
    } else if (i.startsWith('D')) {
      tableType = 'profile'
    }

    if (censusType.startsWith("acs")) {
      src = "acs"
    } else if (censusType.startsWith("dec")) {
      src = "dec"
    }

    censusParams = {
      vintage: vintage, // required
      geoHierarchy: {
        // required
        state: stateCodes,
        place: muniCodes,
      },
      //cant make call for data and geojson at the same time
      //geoResolution: "5m",
      sourcePath: [src, censusType, tableType], // required
      //sourcePath: ["acs", "acs5"],
      values: ["NAME", "group(" + i + ")"], // required
      statsKey: "7d28d36d1b0595e1faf3c7c56ed6df8f4def1452" // required for > 500 calls per day
    }

    return censusPromise(censusParams).then(function(json) {
        return json
      })
      .then(function(json) {
        return json
      })
  }

  for (let i = 0; i < tables.length; i++) {
    getTable(tables[i]).then(function(r) {
      document.getElementById('dvData').innerHTML += json2table(r)
    })
  }
}

function censusTract(censusType, vintage, lat, long, tables, tractcodes = "*", allocate = false, inGeo = null) {

  function censusPromise(args) {
    return new Promise(function(resolve, reject) {
      census(args, function(err, json) {
        if (!err) {
          resolve(json);
        } else {
          reject(err);
        }
      });
    });
  }

  var tableType;

  function getTable(i) {

    if (i.startsWith('S')) {
      tableType = 'subject'
    } else if ((i.startsWith('B')) || (i.startsWith('C'))) {
      tableType = ''
    } else if (i.startsWith('D')) {
      tableType = 'profile'
    }

    if (censusType.startsWith("acs")) {
      src = "acs"
    } else if (censusType.startsWith("dec")) {
      src = "dec"
    }

    censusParams = {
      vintage: vintage, // required
      geoHierarchy: {
        // required
        //state: stateCodes,
        county: {
          "lat": lat,
          "lng": long
        },
        tract: tractcodes,
      },
      //cant make call for data and geojson at the same time
      //geoResolution: "5m",
      sourcePath: [src, censusType, tableType], // required
      //sourcePath: ["acs", "acs5"],
      values: ["NAME", "group(" + i + ")"], // required
      statsKey: "7d28d36d1b0595e1faf3c7c56ed6df8f4def1452" // required for > 500 calls per day
    }

    return censusPromise(censusParams).then(function(json) {
        return json
      })
      .then(function(json) {
        return json
      })
  }

  function returnCensusTables() {
    //var arr = []
    for (let i = 0; i < tables.length; i++) {
      let tName = tables[i].split('-')[0]
      let tLable = tables[i].split('-')[1]
      getTable(tName).then(function(a) {
        if(allocate == true){
          console.log(tLable)
          allocCensusData(a, "data/CMAP2010_ratios_TR.csv","TRACT", "TR", inGeo, tLable)
        }
        else{
          document.getElementById('dvData').innerHTML += json2table(a)
        }
      })
    }
  }

  returnCensusTables()
}

function censusBlockGroup(censusType, vintage, lat, long, tables, bgcodes = "*",allocate = false, inGeo = null) {

  // //Remove existing table to replaced with data selection
  // var element = document.getElementsByTagName("Table"),
  //   index;
  //
  // for (index = element.length - 1; index >= 0; index--) {
  //   element[index].parentNode.removeChild(element[index]);
  // }

  function censusPromise(args) {
    return new Promise(function(resolve, reject) {
      census(args, function(err, json) {
        if (!err) {
          resolve(json);
        } else {
          reject(err);
        }
      });
    });
  }

  var tableType;

  function getTable(i) {

    if (i.startsWith('S')) {
      tableType = 'subject'
    } else if ((i.startsWith('B')) || (i.startsWith('C'))) {
      tableType = ''
    } else if (i.startsWith('D')) {
      tableType = 'profile'
    }

    if (censusType.startsWith("acs")) {
      src = "acs"
    } else if (censusType.startsWith("dec")) {
      src = "dec"
    }

    censusParams = {
      vintage: vintage, // required
      geoHierarchy: {
        // required
        //state: 17,
        county: {
          "lat": lat,
          "lng": long
        },
        //"tract": "*",
        "block group": bgcodes,
      },
      //cant make call for data and geojson at the same time
      //geoResolution: "5m",
      sourcePath: [src, censusType, tableType], // required
      //sourcePath: ["acs", "acs5"],
      values: ["NAME", "group(" + i + ")"], // required
      statsKey: "7d28d36d1b0595e1faf3c7c56ed6df8f4def1452" // required for > 500 calls per day
    }
    //console.log(censusParams)
    return censusPromise(censusParams).then(function(json) {
      return json
    })
  }

  //convert to promise



  function returnCensusTables() {
    //var arr = []
    for (let i = 0; i < tables.length; i++) {
      getTable(splitTableName(tables[i])[0]).then(function(a) {
        if(allocate == true){
          allocCensusData(a, "data/CMAP2010_ratios_BG.csv","BLKGRP", "BG", inGeo, splitTableName(tables[i])[1])
        }
        else{
          document.getElementById('dvData').innerHTML += json2table(a)
        }
      })
    }
  }

  returnCensusTables()
}
