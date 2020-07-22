var cpt = require("./compatibility.js"); //兼容性处理模块
var staticData = require('./staticData.js'); //静态数据模块
var methods = require('./methods.js') //更新视图方法模块
var input = require('./inputView.js') //国内境外输入数据模块
var int = require('./intIncTrend.js') //全球疫情数据模块

window.onload = function() {
    //视图兼容处理
    cpt.compatibility();
    //视图跳转处理
    layui.use('form', function() {
        var form = layui.form;
        form.on('select(mainNav)', function(data) {
            myChart.dispose();
            var index = data.elem.selectedIndex;
            if (index == 0) {
                window.location.reload();
            }
            if (index == 1) {
                input.inputView();
            } else {
                int.intIncTrend();
            }
        });
    });
}
var res = {};
var provinceArray = []; //省份数据
var promise = new Promise(function(res, rej) { //队列化
        $.getScript("https://cdn.mdeer.com/data/yqstaticdata.js?callback=callbackstaticdata&t=" + (+new Date),
            function() {
                res();
            }
        );
    })
    //实时数据接口
window.callbackstaticdata = function(respone) {
    // console.log(res)
    res = respone;
    provinceArray = respone.provinceArray;
}


//新闻接口
window.callbackcontentdtos = function(res) {
    var chinaData = '';
    // console.log(res)
    var str = '';
    for (let i = 0; i < 10; i++) {
        str = str + `<div class="data">
        <p class="time"><img src="images/time.png" width="10px">` + res[i].realPublishTime + `</p>
        <p class="title"><img src="images/logo4.png" width="20px"><a href="` + res[i].url + `" target="_blank">` + res[i].title + `</a></p>
        <p class="content">` + res[i].abs.substring(3, res[i].abs.indexOf('</p>')) + `</p>
        <p class="origin"><img src="images/logo2.png" width='20px'">&nbsp;来源：` + res[i].authorName + `</p>
    </div>`;
    }
    // console.log(JSON.stringify(res));
    $('#left .news').append(str);
}
$.getScript("https://cdn.mdeer.com/contentdtos.js?callback=callbackcontentdtos&t=" + (+new Date));


/*获取地图数据*/
//各省份地图json api
var myChart = echarts.init(document.getElementById('main'));
var flag = true; //二层点击标志
var provinceGeo = staticData.provinceGeo;
var currentMapName = 'china';
var max = 480,
    min = 9; // todo 
var maxSize4Pin = 100,
    minSize4Pin = 20;
myChart.showLoading();
var uploadedDataURL = 'https://geo.datav.aliyun.com/areas/bound/100000_full.json';
var geoCoordMap = {};
var data = [];
var convertData = function(data) {
    var res = [];
    for (var i = 0; i < data.length; i++) {
        var geoCoord = geoCoordMap[data[i].name];
        if (geoCoord) {
            res.push({
                name: data[i].name,
                value: geoCoord.concat(data[i].value),
            });
        }
    }
    return res;
};
//option设置
var option = {
    //全局设置
    // backgroundColor: {
    //     type: 'linear',
    //     x: 0,
    //     y: 0,
    //     x2: 1,
    //     y2: 1,
    //     // colorStops: [{
    //     //     offset: 0,
    //     //     color: '#0f378f' // 0% 处的颜色
    //     // }, {
    //     //     offset: 1,
    //     //     color: '#00091a' // 100% 处的颜色
    //     // }],
    // },
    backgroundColor: '#051b4a',
    tooltip: {
        trigger: 'item',
        formatter: function(params) {
            if (typeof(params.value)[2] == "undefined") {
                return params.name + '<br>现存确诊: ' + params.value;
            } else {
                return params.name + '<br>现存确诊: ' + params.value[2];
            }
        }
    },

    //视觉映射组件
    visualMap: {
        min: 0,
        max: 50,
        show: true,
        min: 0,
        color: 'white',
        left: '22%',
        bottom: '15',
        text: ['高', '低'], // 文本，默认为数值文本
        calculable: true,
        textStyle: {
            color: "white"
        },
        seriesIndex: [1],
        inRange: {
            color: ['yellow', 'red']
        }
    },

    //地图组件
    geo: {
        show: true,
        // --- //
        map: currentMapName,
        layoutCenter: ['50%', '65%'],
        // 如果宽高比大于 1 则宽度为 100，如果小于 1 则高度为 100，保证了不超过 100x100 的区域
        layoutSize: '120%',
        label: {
            normal: {
                show: false
            },
            emphasis: {
                show: false,
            }
        },
        itemStyle: {
            normal: {
                areaColor: '#031525',
                borderColor: '#fff',
                shadowColor: 'orange', //外发光
                shadowBlur: 8
            },
            emphasis: {
                areaColor: '#2B91B7',
            }
        }
    },

    //序列
    series: [{
            name: '散点',
            type: 'scatter',
            coordinateSystem: 'geo',
            data: convertData(data),
            symbolSize: function(val) {
                return 5;
            },
            label: {
                normal: {
                    formatter: '{b}',
                    align: 'center',
                    verticalAlign: 'top',
                    show: true,
                    color: '#fc6565'
                },
                emphasis: {
                    // show: true
                }
            },
            itemStyle: {
                normal: {
                    color: 'turquoise'
                }
            }
        }, {
            type: 'map',
            map: currentMapName,
            geoIndex: 0,
            animation: false,
            layoutCenter: ['30%', '30%'],
            // 如果宽高比大于 1 则宽度为 100，如果小于 1 则高度为 100，保证了不超过 100x100 的区域
            layoutSize: 10,
            data: data
        }, {
            name: '点',
            type: 'scatter',
            coordinateSystem: 'geo',
            symbol: 'pin', //气泡

            symbolSize: function(val) {
                if (val[2] == 0) {
                    return 0;
                }
                return 40;
            },
            label: {
                normal: {
                    show: true,
                    textStyle: {
                        color: '#fff',
                        fontSize: 9,
                    },
                    formatter(value) {
                        return value.data.value[2]
                    }
                }
            },
            itemStyle: {
                normal: {
                    color: 'turquoise', //标志颜色
                }
            },
            zlevel: 6,
            data: convertData(data)
        }, {
            name: 'Top 5',
            type: 'effectScatter',
            coordinateSystem: 'geo',
            data: convertData(data.sort(function(a, b) {
                return b.value - a.value;
            }).slice(0, 5)),
            symbolSize: function(val) {
                if (val[2] == 0) {
                    return 0;
                }
                return 15;
            },
            showEffectOn: 'render',
            rippleEffect: {
                brushType: 'stroke'
            },
            hoverAnimation: true,
            label: {
                normal: {
                    formatter: '{b}',
                    align: 'center',
                    verticalAlign: 'top',
                    show: true,
                    color: 'red'
                }
            },
            itemStyle: {
                normal: {
                    color: 'turquoise',
                    fontSize: 20
                }
            },
            zlevel: 1
        }

    ]
};

promise.then(function() { //链式调用 防止异步~
    var selectData = '';
    $('#sel').append(`<option>国内疫情新增趋势</option>`);
    for (let i = 0; i < res.intTrend.length; i++) {
        selectData = selectData + `<option>` + res.intTrend[i].childStatistic + `疫情新增趋势</option>`
    }
    $('#sel').append(selectData)
    $.getJSON(uploadedDataURL, function(geoJson) {
        methods.upadate(echarts, myChart, geoJson, option, data, geoCoordMap, currentMapName, convertData, provinceArray, flag);
        methods.updateProviceDate(res);
        console.log(res);
    });
})

myChart.on('click', function(params) {
    var geoName = params.data.name.substring(0, 2);
    //
    if (geoName == '香港' || geoName == '台湾' || geoName == '澳门') {
        return;
    }
    if (flag) { //判断是否为二级地图
        flag = !flag;
        data = [];
        geoCoordMap = {};
        myChart.showLoading();
        //根据params获取到对应的urlchild子图geojson数据
        var urlChild = provinceGeo[params.data.name];
        $.getJSON(urlChild, function(geoJson) {
            option.geo.layoutSize = '80%';
            option.geo.layoutCenter = ['50%', '50%'];
            $('.datalist-name').html(params.data.name);
            currentMapName = params.data.name;
            methods.updateCityDate(currentMapName, res); //更新数据
            echarts.registerMap(currentMapName, geoJson);
            option.geo.map = currentMapName;
            option.geo.zoom = 1;
            option.series[1] = option.series[1];
            methods.upadate(echarts, myChart, geoJson, option, data, geoCoordMap, currentMapName, convertData, provinceArray, flag); //更新地图
        })
    }
})

//返回上一级
document.getElementsByClassName('back')[0].addEventListener('click', function() {
    if (!flag) {
        flag = !flag;
        data = [];
        geoCoordMap = {};
        $.getJSON(uploadedDataURL, function(geoJson) {
            option.geo.layoutSize = '120%';
            option.geo.layoutCenter = ['50%', '65%'];
            $('.datalist-name').html('中华人民共和国');
            methods.updateProviceDate(res);
            methods.upadate(echarts, myChart, geoJson, option, data, geoCoordMap, currentMapName, convertData, provinceArray, flag);
        });
    }
})