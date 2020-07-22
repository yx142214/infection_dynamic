var input = require('./inputView.js') //国内境外输入数据模块
module.exports = {
    intIncTrend: function() {
        //初始化
        layui.use('form', function() {
            var form = layui.form;
            form.on('select(mainNav)', function(data) {
                var index = data.elem.selectedIndex;
                if (index == 0) {
                    window.location.reload();
                }
                if (index == 1) {
                    window.location.reload();
                }
                if (index == 2) {

                }
            });
        });

        $('.dataChild').html('');
        $('.data-title span').html('全球疫情数据');
        $('.main-nav').css('display', 'block');
        $('.back').css('display', 'none');

        var main = document.getElementById('main');
        var mychart3 = echarts.init(main);
        mychart3.showLoading();
        var promise = new Promise(function(res, rej) { //队列化
            $.getScript("https://cdn.mdeer.com/data/yqstaticdata.js?callback=callbackstaticdata&t=" + (+new Date),
                function() {
                    res();
                }
            );
        });
        var timeData = [];
        var sureData = [];
        var deathData = [];
        var curedData = [];
        var str = '';
        promise.then(function() {
            //下拉框选项渲染

            str = `<div class="data-body">
    <p class="data-name">` + res.abroadSum.childStatistic + `</p>
    <p class="data-current">` + res.abroadSum.currentConfirm + `</p>
    <p class="data-total">` + res.abroadSum.totalConfirmed + `</p>
    <p class="data-input">` + res.abroadSum.totalDeath + `</p>
</div>`;
            $('.datalist-name').css('display', 'none');
            $('.back').css('display', 'none');
            $('.china-data').css('display', 'none');
            document.getElementsByClassName('data-input')[0].innerHTML = '死亡';
            $('.datalist').css('display', 'block');
            $('#right .dataChild').append(str);
            $('.data-body').css('margin-top', '7px');

            // 国内新增趋势
            for (let i = res.incTrend.length - 15; i < res.incTrend.length; i++) {
                timeData.push(res.incTrend[i].day);
                sureData.push(res.incTrend[i].sure_cnt);
                deathData.push(res.incTrend[i].die_cnt);
                curedData.push(res.incTrend[i].cure_cnt);
            }
            //国外疫情新增数据
            layui.use('form', function() {
                var form = layui.form;
                form.on('select(toSelGoodsID)', function(data) {
                    //获取当前选中下拉项的索引
                    var indexGID = data.elem.selectedIndex;
                    timeData = [];
                    sureData = [];
                    deathData = [];
                    curedData = [];
                    var index = indexGID - 1;
                    if (index == -1) {
                        for (let i = res.incTrend.length - 15; i < res.incTrend.length; i++) {
                            timeData.push(res.incTrend[i].day);
                            sureData.push(res.incTrend[i].sure_cnt);
                            deathData.push(res.incTrend[i].die_cnt);
                            curedData.push(res.incTrend[i].cure_cnt);
                        }
                        option.xAxis[0].data = timeData;
                        option.series[0].data = sureData;
                        option.series[1].data = curedData;
                        option.series[2].data = deathData;
                        mychart3.setOption(option);
                    } else {
                        for (let i = res.intTrend[index].trend.length - 25; i < res.intTrend[index].trend.length; i++) {
                            timeData.push(res.intTrend[index].trend[i].day);
                            sureData.push(res.intTrend[index].trend[i].inc_sure);
                            deathData.push(res.intTrend[index].trend[i].die_cnt - res.intTrend[index].trend[i - 1].die_cnt);
                            curedData.push(res.intTrend[index].trend[i].cure_cnt - res.intTrend[index].trend[i - 1].cure_cnt);
                        }
                        option.xAxis[0].data = timeData;
                        option.series[0].data = sureData;
                        option.series[1].data = curedData;
                        option.series[2].data = deathData;
                        mychart3.setOption(option);
                    }
                });
            });


            //各洲块数据
            str = '';
            for (let i = 0; i < res.continentDataList.length; i++) {
                var childStr = '';
                for (let k = 0; k < res.continentDataList[i].countriesData.length; k++) {
                    childStr = childStr + `<dd>
            <p class="data-name">` + res.continentDataList[i].countriesData[k].childStatistic + `</p>
            <p class="data-current">` + res.continentDataList[i].countriesData[k].currentConfirm + `</p>
            <p class="data-total">` + res.continentDataList[i].countriesData[k].totalConfirmed + `</p>
            <p class="data-death">` + res.continentDataList[i].countriesData[k].totalDeath + `</p>
        </dd>`;
                };
                str = str + `<li class="layui-nav-item">
                            <a>` + res.continentDataList[i].continentName + `</a>
                            <dl class="layui-nav-child">` + childStr + `</dl>
                        </li>`;

            }
            str = `<ul class="layui-nav layui-nav-tree" lay-filter="test">` + str + `</ul>`;
            $('#right .dataChild').append(str);
            layui.use('element', function() {
                var element = layui.element;
            });
            // for (let i = 0; i < res.continentDataList.length; i++) {
            //     str = str + `<div class="data-body">
            //     <p class="data-name">` + res.continentDataList[i].continentName + `</p>
            //     <p class="data-current">` + res.continentDataList[i].currentConfirmed + `</p>
            //     <p class="data-total">` + res.continentDataList[i].totalConfirmed + `</p>
            //     <p class="data-input">` + '' + `</p>
            // </div>`;
            // }

            mychart3.hideLoading();
            mychart3.setOption(option)
        });

        //实时数据接口
        var res = {};
        window.callbackstaticdata = function(respone) {
            res = respone;
        }

        option = {
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
            legend: {
                show: true,
                x: 'center',
                top: '20%',
                y: '35',
                icon: 'stack',
                itemWidth: 24,
                itemHeight: 15,
                textStyle: {
                    color: '#1bb4f6'
                },
                data: ['新增确诊数', '新增治愈数', '新增死亡数']
            },
            tooltip: {
                show: true,
                formatter: `<img src="./images/time.png" width="20px" style="vertical-align: bottom">
                    时间:2020.{b}<br>
                    <img src="./images/cured.png" width="20px" style="vertical-align: bottom">
                    {a1}:{c1}<br>
                    <img src="./images/sure.png" width="20px" style="vertical-align: bottom">
                    {a0}:{c0}<br>
                    <img src="./images/death.png" width="20px" style="vertical-align: bottom">
                    {a2}:{c2}`,
                trigger: 'axis',
                axisPointer: {
                    lineStyle: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [{
                                offset: 0,
                                color: 'rgba(0, 255, 233,0)'
                            }, {
                                offset: 0.5,
                                color: 'rgba(255, 255, 255,1)',
                            }, {
                                offset: 1,
                                color: 'rgba(0, 255, 233,0)'
                            }],
                        }
                    },
                },
            },
            grid: {
                top: '25%',
                left: '25%',
                right: '25%',
                bottom: '20%',
            },
            xAxis: [{
                type: 'category',
                axisLine: {
                    show: true
                },
                splitArea: {
                    // show: true,
                    color: '#f00',
                    lineStyle: {
                        color: '#f00'
                    },
                },
                axisLabel: {
                    margin: 30,
                    color: '#fff'
                },
                splitLine: {
                    show: false
                },
                boundaryGap: false,
                data: timeData,
            }],

            yAxis: [{
                type: 'value',
                min: 0,
                max: sureData.concat(curedData).concat(deathData).sort()[0],
                splitNumber: 4,
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: 'rgba(255,255,255,0.1)'
                    }
                },
                axisLine: {
                    show: true,
                },
                axisLabel: {
                    show: true,
                    margin: 15,
                    textStyle: {
                        color: '#d1e6eb',

                    },
                },
                axisTick: {
                    show: false,
                },
            }],
            series: [{
                    name: '新增确诊数',
                    type: 'line',
                    showAllSymbol: true,
                    symbol: 'circle',
                    symbolSize: 15,
                    lineStyle: {
                        normal: {
                            color: "#fc6565",
                            shadowColor: 'rgba(0, 0, 0, .3)',
                            shadowBlur: 0,
                            shadowOffsetY: 5,
                            shadowOffsetX: 5,
                        },
                    },
                    label: {
                        show: true,
                        position: 'top',
                        textStyle: {
                            color: '#fc6565',
                        }
                    },
                    itemStyle: {
                        color: "#fc6565",
                        borderColor: "#fff",
                        borderWidth: 2,
                        shadowColor: 'rgba(0, 0, 0, .3)',
                        shadowBlur: 0,
                        shadowOffsetY: 2,
                        shadowOffsetX: 2,
                    },
                    areaStyle: {
                        normal: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                    offset: 0,
                                    color: 'rgba(108,80,243,0.3)'
                                },
                                {
                                    offset: 1,
                                    color: 'rgba(108,80,243,0)'
                                }
                            ], false),
                            shadowColor: 'rgba(108,80,243, 0.9)',
                            shadowBlur: 20
                        }
                    },
                    data: sureData
                },
                {
                    name: '新增治愈数',
                    type: 'line',
                    showAllSymbol: true,
                    symbol: 'circle',
                    symbolSize: 15,
                    lineStyle: {
                        normal: {
                            color: "#00ca95",
                            shadowColor: 'rgba(0, 0, 0, .3)',
                            shadowBlur: 0,
                            shadowOffsetY: 5,
                            shadowOffsetX: 5,
                        },
                    },
                    label: {
                        show: true,
                        position: 'top',
                        textStyle: {
                            color: '#00ca95',
                        }
                    },

                    itemStyle: {
                        color: "#00ca95",
                        borderColor: "#fff",
                        borderWidth: 2,
                        shadowColor: 'rgba(0, 0, 0, .3)',
                        shadowBlur: 0,
                        shadowOffsetY: 2,
                        shadowOffsetX: 2,
                    },
                    areaStyle: {
                        normal: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                    offset: 0,
                                    color: 'rgba(0,202,149,0.3)'
                                },
                                {
                                    offset: 1,
                                    color: 'rgba(0,202,149,0)'
                                }
                            ], false),
                            shadowColor: 'rgba(0,202,149, 0.9)',
                            shadowBlur: 20
                        }
                    },
                    data: curedData,
                }, {
                    name: '新增死亡数',
                    type: 'line',
                    showAllSymbol: true,
                    symbol: 'circle',
                    symbolSize: 15,
                    lineStyle: {
                        normal: {
                            color: "#9e9e9e",
                            shadowColor: 'rgba(0, 0, 0, .3)',
                            shadowBlur: 0,
                            shadowOffsetY: 5,
                            shadowOffsetX: 5,
                        },
                    },
                    label: {
                        show: true,
                        position: 'top',
                        textStyle: {
                            color: '#9e9e9e',
                        }
                    },

                    itemStyle: {
                        color: "#9e9e9e",
                        borderColor: "#fff",
                        borderWidth: 2,
                        shadowColor: 'rgba(0, 0, 0, .3)',
                        shadowBlur: 0,
                        shadowOffsetY: 2,
                        shadowOffsetX: 2,
                    },
                    areaStyle: {
                        normal: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                    offset: 0,
                                    color: 'rgba(0,202,149,0.3)'
                                },
                                {
                                    offset: 1,
                                    color: 'rgba(0,202,149,0)'
                                }
                            ], false),
                            shadowColor: 'rgba(0,202,149, 0.9)',
                            shadowBlur: 20
                        }
                    },
                    data: deathData,
                }
            ]
        };
    }
}