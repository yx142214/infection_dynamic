module.exports = {
    compatibility: function() {
        var h1 = document.getElementsByClassName('data-head')[0].clientHeight;
        var h2 = document.getElementsByClassName('data-title')[0].clientHeight;
        var rightHeight = document.getElementById('right').clientHeight;
        //margin  --- 30px
        document.getElementsByClassName('datalist')[0].style.height = rightHeight - h1 - h2 - 42 + 'px';
        document.getElementsByClassName('datalist')[0].style.display = 'block';
        //

        var h3 = document.getElementsByClassName('news-title')[0].clientHeight;
        var leftHeight = document.getElementById('left').clientHeight;
        document.getElementsByClassName('news')[0].style.height = leftHeight - h3 - 33 + 'px';
        document.getElementsByClassName('news')[0].style.display = 'block';
    }
}