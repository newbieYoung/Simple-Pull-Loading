/**
 * Created by newyoung on 2019/8/14.
 */

(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['prefix-umd'], factory)
  } else if (typeof module === 'object' && module.exports) {
    // Node/CommonJS
    module.exports = factory(require('prefix-umd'))
  } else {
    // Browser globals
    window.SimplePullLoading = factory(window.Prefix)
  }
})(function (Prefix) {
  var transformProperty = Prefix.prefix('transform')

  /**
   * tyle 类型 down-下拉刷新 up-上拉刷新
   * $outer 外层容器
   * $inner 内层容器
   * $list  滚动列表
   */
  function SimplePullLoading(config) {
    if (!config || typeof config !== 'object') {
      console.error('参数异常')
      return
    }

    this.$outer = config.$outer;
    this.$inner = config.$inner;
    this.$list = config.$list;
    this.type = config.type || 'down';
    this.backgroundColor = config.backgroundColor;
    this.default();
    this.event();
  }

  SimplePullLoading.prototype.default = function () {
    /*
     * 0-20 nothing
     * 20-60 tip
     * 60-100 loading、success 
     */
    this._moveY = 0;
    this._maxMoveY = 100;
    this._pullMinHeight = 20;
    this._loadingMinHeight = 60;

    this._successClass = 'sim-success';
    this._tipClass = 'sim-tip';
    this._loadingClass = 'sim-loading';

    this.$pull = document.createElement('div');
    this.$pull.classList.add('sim-pull-loading');

    var html = '';
    html += '<div class="pull-tip">下拉刷新</div>';
    html += '<div class="pull-loading">';
    html += '<div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>';
    html += '<p>正在加载</p>';
    html += '</div>'
    html += '<div class="pull-success">刷新成功</div>'

    this.$pull.innerHTML = html;
    this.$outer.appendChild(this.$pull);

    switch (this.type) {
      case 'down':
        this.$pull.style.top = '0px';
        break;
      case 'up':
        this.$pull.style.bottom = 0;
        break;
      default:
        break;
    }
  }

  //事件监听
  SimplePullLoading.prototype.event = function () {

  }

  return SimplePullLoading
})