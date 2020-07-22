var int = require('./intIncTrend.js') //全球疫情数据模块
module.exports = {
    inputView: function() {
        layui.use('form', function() {
            var form = layui.form;
            form.on('select(mainNav)', function(data) {
                var index = data.elem.selectedIndex;
                if (index == 0) {
                    window.location.reload();
                }
                if (index == 1) {

                }
                if (index == 2) {
                    mychart2.dispose();
                    int.intIncTrend();
                }
            });
        });

        $('.back').css('display', 'none');
        $('.main-nav').css('display', 'none');
        var mychart2 = echarts.init(document.getElementById('main'));
        var uploadedDataURL = 'https://geo.datav.aliyun.com/areas/bound/100000_full.json';
        mychart2.showLoading();
        var res = {};
        var provinceArray = []; //省份数据
        var chinaGeoCoordMap = {};
        var chinaDatas = [];
        var series = [];
        var promise = new Promise(function(res, rej) { //队列化
            $.getScript("https://cdn.mdeer.com/data/yqstaticdata.js?callback=callbackstaticdata&t=" + (+new Date),
                function() {
                    res();
                }
            );
        });
        promise.then(function() {
            $.get(uploadedDataURL, function(json) {
                updataJwsr(json);
                mychart2.hideLoading();
                echarts.registerMap('china', json);
                mychart2.setOption(option)
                console.log(chinaDatas)
                console.log(chinaGeoCoordMap)
            })
        });

        //实时数据接口
        window.callbackstaticdata = function(respone) {
            res = respone;
            provinceArray = respone.provinceArray;
        }
        var i = 10;

        //更新视图函数
        var updataJwsr = function(json) {
            console.log(res);
            chinaGeoCoordMap['境外输入'] = [126, 35];
            chinaDatas.push([{
                name: '境外输入',
                value: res.country.abroadInputConfirmed
            }])
            for (let i = 0; i < res.provinceArray.length; i++) {
                for (let j = 0; j < res.provinceArray[i].cityArray.length; j++) {
                    if (res.provinceArray[i].cityArray[j].childStatistic == '境外输入') {
                        for (let k = 0; k < json.features.length; k++) {
                            if (json.features[k].properties.name == res.provinceArray[i].childStatistic) {
                                chinaGeoCoordMap[res.provinceArray[i].childStatistic] = json.features[k].properties.center;
                                break;
                            }
                        }
                        if (res.provinceArray[i].cityArray[j].currentConfirm != 0) {
                            chinaDatas.push([{
                                name: res.provinceArray[i].childStatistic,
                                value: res.provinceArray[i].cityArray[j].currentConfirm,
                                totalConfirmed: res.provinceArray[i].cityArray[j].totalConfirmed,
                                totalCured: res.provinceArray[i].cityArray[j].totalCured
                            }])
                        }
                    }
                }
            };
            console.log(chinaDatas)
            var str = '';
            for (let i = 1; i < chinaDatas.length; i++) {
                console.log(11)
                str = str + `<div class="data-body">
        <p class="data-name">` + chinaDatas[i][0].name + `</p>
        <p class="data-current">` + chinaDatas[i][0].value + `</p>
        <p class="data-total">` + chinaDatas[i][0].totalConfirmed + `</p>
        <p class="data-input">` + chinaDatas[i][0].totalCured + `</p>
    </div>`;
            }
            $('.datalist .dataChild').append(str);
            $('.datalist').css('display', 'block');
            $('.china-data').css('display', 'none');
            document.getElementsByClassName('data-input')[0].innerHTML = '治愈';
            $('.data-title button span').html('国内境外输入病例数据');
            [
                ['境外输入', chinaDatas]
            ].forEach(function(item, i) {
                series.push({
                    type: 'scatter',
                    symbol: 'pin',
                    coordinateSystem: 'geo',
                    symbolSize: 60,
                    zlevel: 15,
                    itemStyle: {
                        normal: {
                            color: 'turquoise', //标志颜色
                        }
                    },
                    label: {
                        normal: {
                            show: true,
                            textStyle: {
                                color: '#fff',
                                fontSize: 12,
                            },
                            formatter(value) {
                                return res.country.abroadInputConfirmed
                            }
                        }
                    },
                    data: [{
                        name: '境外输入',
                        value: [126, 35].concat(res.country.abroadInputConfirmed)
                    }]
                }, {
                    type: 'lines',
                    zlevel: 2,
                    effect: {
                        show: true,
                        period: 4, //箭头指向速度，值越小速度越快
                        trailLength: 0.02, //特效尾迹长度[0,1]值越大，尾迹越长重
                        symbol: 'arrow', //箭头图标
                        symbolSize: 5, //图标大小
                    },
                    lineStyle: {
                        normal: {
                            width: 1, //尾迹线条宽度
                            opacity: 1, //尾迹线条透明度
                            curveness: .3 //尾迹线条曲直度
                        }
                    },
                    data: convertData(item[1])
                }, {
                    type: 'effectScatter',
                    coordinateSystem: 'geo',
                    zlevel: 2,
                    rippleEffect: { //涟漪特效
                        period: 4, //动画时间，值越小速度越快
                        brushType: 'stroke', //波纹绘制方式 stroke, fill
                        scale: 4 //波纹圆环最大限制，值越大波纹越大
                    },
                    label: {
                        normal: {
                            show: true,
                            position: 'right', //显示位置
                            offset: [5, 0], //偏移设置
                            formatter: function(params) { //圆环显示文字
                                return params.data.name;
                            },
                            fontSize: 13
                        },
                        emphasis: {
                            show: true
                        }
                    },
                    symbol: 'circle',
                    symbolSize: function(val) {
                        if (val[2] / 5 < 5) {
                            return 5 //圆环大小
                        }
                        if (val[2] / 5 > 30) {
                            return 30
                        } else {
                            return val[2] / 5
                        }
                    },
                    // symbolSize: 8,
                    itemStyle: {
                        normal: {
                            show: false,
                            color: '#f00'
                        }
                    },
                    data: item[1].map(function(dataItem) {
                        return {
                            name: dataItem[0].name,
                            value: chinaGeoCoordMap[dataItem[0].name].concat(dataItem[0].value)
                                // chinaGeoCoordMap[dataItem[0].name].concat([randomValue()])
                        };
                    }),
                });
            });
        };

        var option = {
            backgroundColor: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 1,
                y2: 1,
                colorStops: [{
                    offset: 0,
                    color: '#0f378f' // 0% 处的颜色
                }, {
                    offset: 1,
                    color: '#00091a' // 100% 处的颜色
                }],
                globalCoord: false // 缺省为 false
            },
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(166, 200, 76, 0.82)',
                borderColor: '#FFFFCC',
                showDelay: 0,
                hideDelay: 0,
                enterable: true,
                transitionDuration: 0,
                extraCssText: 'z-index:100',
                formatter: function(params) {
                    //根据业务自己拓展要显示的内容
                    console.log(params)
                    var res = "";
                    var name = params.name;
                    res = "<span style='color:#fff;'>" + name + "</span><br/>现存境外输入：" + (params.value[2] ? params.value[2] : params.value);
                    return res;
                }
            },
            visualMap: { //图例值控制
                min: 0,
                max: 100,
                bottom: '15',
                left: '22%',
                calculable: true,
                show: true,
                color: ['#ff3b3b', '#fc9700', '#ffde00', '#ffde00', '#00eaff'],
                textStyle: {
                    color: '#fff'
                }
            },
            geo: {
                map: 'china',
                zoom: 1,
                layoutSize: '120%',
                roam: false,
                layoutCenter: ['50%', '65%'],
                label: {
                    emphasis: {
                        show: false
                    }
                },
                itemStyle: {
                    normal: {
                        borderColor: 'rgba(147, 235, 248, 1)',
                        borderWidth: 0.5,
                        areaColor: {
                            type: 'radial',
                            x: 0.5,
                            y: 0.5,
                            r: 0.8,
                            colorStops: [{
                                offset: 0,
                                color: 'rgba(147, 235, 248, 0)' // 0% 处的颜色
                            }, {
                                offset: 1,
                                color: 'rgba(147, 235, 248, .2)' // 100% 处的颜色
                            }],
                            globalCoord: false // 缺省为 false
                        },
                        shadowColor: 'rgba(128, 217, 248, 1)',
                        // shadowColor: 'rgba(255, 255, 255, 1)',
                        shadowOffsetX: -2,
                        shadowOffsetY: 2,
                        shadowBlur: 10
                    },
                    emphasis: {
                        areaColor: '#389BB7',
                        borderWidth: 0
                    }
                }
            },
            series: series
        };

        function randomValue() {
            return Math.ceil(Math.random() * 10000 + 1)
        }

        var convertData = function(data) {
            var res = [];
            for (var i = 0; i < data.length; i++) {
                var dataItem = data[i];
                var fromCoord = chinaGeoCoordMap[dataItem[0].name];
                var toCoord = [126, 35];
                if (fromCoord && toCoord) {
                    res.push([{
                        coord: toCoord,
                        value: dataItem[0].value,
                        name: dataItem[0].name,
                        // value: randomValue()
                    }, {
                        coord: fromCoord,
                    }]);
                }
            }
            return res;
        };
    }
}