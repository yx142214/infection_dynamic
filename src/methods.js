module.exports = {
    updateProviceDate: function(res) { //更新各省份数据
        $('.ljqz').html(res.country.totalConfirmed);
        $('.xcqz').html(res.country.currentConfirm);
        $('.ljsw').html(res.country.totalDeath);
        $('.jwsr').html(res.country.abroadInputConfirmed);
        $('.inc-ljqz').html(res.incCountry.incConfirmedFlag + res.incCountry.incConfirmed);
        $('.inc-xcqz').html(res.incCountry.incCurConfirmedFlag + res.incCountry.incCurConfirmed);
        $('.inc-ljsw').html(res.incCountry.incDeathFlag + res.incCountry.incDeath);
        $('.inc-jwsr').html(res.incCountry.incAbroadInputConfirmedFlag + res.incCountry.incAbroadInputConfirmed);
        var str = '';
        for (let i = 0; i < res.provinceArray.length; i++) {
            var jwsr = 0;
            if (res.provinceArray[i].cityArray[0].childStatistic == '境外输入') {
                jwsr = res.provinceArray[i].cityArray[0].currentConfirm;
            }
            str = str + `<div class="data-body">
                <p class="data-name">` + res.provinceArray[i].childStatistic + `</p>
                <p class="data-current">` + res.provinceArray[i].currentConfirm + `</p>
                <p class="data-total">` + res.provinceArray[i].totalConfirmed + `</p>
                <p class="data-input">` + jwsr + `</p>
            </div>`;
        }
        $('.datalist .dataChild').html('');
        $('.datalist .dataChild').append(str);
    },

    updateCityDate: function(currentMapName, res) { //更新各市级视图
        var str = '';
        for (let i = 0; i < res.provinceArray.length; i++) {
            var jwsr = 0;
            var incJwsr = '0';
            if (res.provinceArray[i].childStatistic.substring(0, 2) == currentMapName.substring(0, 2) || res.provinceArray[i].childStatistic.substring(2, 4) == currentMapName.substring(0, 2)) {
                for (let j = 0; j < res.provinceArray[i].cityArray.length; j++) {
                    // console.log(res.provinceArray[i].cityArray[j].childStatistic)
                    if (res.provinceArray[i].cityArray[j].childStatistic == '境外输入') {
                        jwsr = res.provinceArray[i].cityArray[j].currentConfirm;
                        incJwsr = res.provinceArray[i].cityArray[j].totalIncrease;
                    }
                    str = str + `<div class="data-body">
                    <p class="data-name">` + res.provinceArray[i].cityArray[j].childStatistic + `</p>
                    <p class="data-current">` + res.provinceArray[i].cityArray[j].currentConfirm + `</p>
                    <p class="data-total">` + res.provinceArray[i].cityArray[j].totalConfirmed + `</p>
                    <p class="data-input">` + '' + `</p>
                </div>`;
                }
                $('.ljqz').html(res.provinceArray[i].totalConfirmed);
                $('.xcqz').html(res.provinceArray[i].currentConfirm);
                $('.ljsw').html(res.provinceArray[i].totalDeath);
                $('.jwsr').html(jwsr);
                $('.inc-ljqz').html(res.provinceArray[i].incProvince.incConfirmedFlag + res.provinceArray[i].incProvince.incConfirmed);
                $('.inc-xcqz').html(res.provinceArray[i].incProvince.incCurConfirmedFlag + res.provinceArray[i].incProvince.incCurConfirmed);
                $('.inc-ljsw').html(res.provinceArray[i].incProvince.incDeathFlag + res.provinceArray[i].incProvince.incDeath);
                $('.inc-jwsr').html('+' + incJwsr);
                break;
            }
        }
        $('.datalist .dataChild').html(' ');
        $('.datalist .dataChild').append(str);
    },

    upadate: function(echarts, myChart, geoJson, option, data, geoCoordMap, currentMapName, convertData, provinceArray, flag) {
        if (currentMapName == '台湾省') {
            geoCoordMap[geoJson.features[0].properties.name] = [121.509062, 25.044332];
            data.push({
                name: geoJson.features[0].properties.name,
                //现存确诊数据接口
                value: 10 * Math.ceil(10 * Math.random())
            });
        } else {
            for (let i = 0; i < geoJson.features.length; i++) {
                var value;
                geoCoordMap[geoJson.features[i].properties.name] = geoJson.features[i].properties.center;
                if (flag) {
                    for (let j = 0; j < provinceArray.length; j++) {
                        if (provinceArray[j].childStatistic.substring(0, 3) == geoJson.features[i].properties.name.substring(0, 3) || provinceArray[j].childStatistic.substring(2, 4) == geoJson.features[i].properties.name.substring(0, 2)) {
                            value = provinceArray[j].currentConfirm;
                        }
                    }
                } else {
                    for (let j = 0; j < provinceArray.length; j++) {
                        if (provinceArray[j].childStatistic.substring(0, 3) == currentMapName.substring(0, 3) || provinceArray[j].childStatistic.substring(2, 4) == geoJson.features[i].properties.name.substring(0, 2)) {
                            for (let k = 0; k < provinceArray[j].cityArray.length; k++) {
                                if (provinceArray[j].cityArray[k].childStatistic.substring(0, 2) == geoJson.features[i].properties.name.substring(0, 2)) {
                                    value = provinceArray[j].cityArray[k].currentConfirm;
                                }
                            }
                        }
                    }
                }
                data.push({
                    name: geoJson.features[i].properties.name,
                    //现存确诊数据接口
                    value: value
                })
            }
        }
        console.log(geoCoordMap);
        echarts.registerMap(currentMapName, geoJson);
        myChart.hideLoading();
        //更新地图轮廓及边界数据
        option.series[0].data = convertData(data);
        option.series[1].data = data;
        option.series[2].data = convertData(data);
        option.series[3].data = convertData(data.sort(function(a, b) {
            return b.value - a.value;
        }).slice(0, 5));
        // //更新地图气泡标签数据


        // //更新地图散点数据


        // //更新地图top人数数据
        myChart.setOption(option);
    }

}