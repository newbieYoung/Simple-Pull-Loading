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
  //兼容性处理
  var transformProperty = Prefix.prefix('transform')
  var transitionDurationPro = Prefix.prefix('transitionDuration');

  function whichTransitionEvent() {
    var t;
    var el = document.createElement('div');
    var transitions = {
      'transition': 'transitionend',
      'OTransition': 'oTransitionEnd',
      'MozTransition': 'transitionend',
      'WebkitTransition': 'webkitTransitionEnd',
      'MsTransition': 'msTransitionEnd'
    };
    for (t in transitions) {
      if (el.style[t] !== undefined) {
        return transitions[t];
      }
    }
  }
  var transitionEndEvent = whichTransitionEvent();

  /**
   * tyle 类型 down-下拉刷新 up-上拉刷新
   * $outer 外层容器
   * $inner 内层容器
   * $list  滚动列表
   * loadingFunc 加载数据回调
   * resultDelay 显示结果时长
   * resultDuration 结果消失动画时长
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
    this.loadingFunc = config.loadingFunc || function () {};
    this.resultDelay = config.resultDelay || 500;
    this.resultDuration = config.resultDuration || .2;


    this._isLoading = false; //是否在加载
    this._isStart = false; //是否启动过组件

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
    this._loosenClass = 'sim-loosen';
    this._tipClass = 'sim-tip';
    this._loadingClass = 'sim-loading';
    this._pullDisplay = 'flex';

    this.$pull = document.createElement('div');
    this.$pull.classList.add('sim-pull-loading');

    var html = '';
    html += '<div class="pull-tip"></div>';
    html += '<div class="pull-loading">';
    html += '<div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>';
    html += '<p>正在加载</p>';
    html += '</div>'
    html += '<div class="pull-success">刷新成功</div>'

    this.$pull.innerHTML = html;
    this.$pull.style.display = 'none'; //隐藏
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
    var self = this;

    var touchStart;
    self.$list.addEventListener('touchstart', function (e) {
      var point = e.touches[0];
      touchStart = {
        x: point.clintX,
        y: point.clientY
      };
    })

    var movePoint;
    self.$list.addEventListener('touchmove', function (e) {
      var point = e.touches[0];
      if (!self._isLoading && ((self.type == 'down' && self.atTop() && point.clientY > touchStart.y) || (self.type == 'up' && self.atBottom() && point.clientY < touchStart.y))) {
        e.preventDefault();
        if (!movePoint) {
          movePoint = {
            x: point.clintX,
            y: point.clientY
          };
          self.showPull(); //显示
        } else {
          var moveY = point.clientY - movePoint.y;

          self._moveY += moveY * (self._maxMoveY - Math.abs(self._moveY)) / self
            ._maxMoveY;

          self.moving();

          if (Math.abs(self._moveY) >= self._pullMinHeight) {
            self.showTip();
          }

          if (Math.abs(self._moveY) >= self._loadingMinHeight) {
            self.showLoosen();
          }

          movePoint.x = point.clientX;
          movePoint.y = point.clientY;
        }
      }
    })

    self.$list.addEventListener('touchend', function () {
      if (!self._isLoading && self._isStart) {
        if (Math.abs(self._moveY) > self._loadingMinHeight) {
          self._isLoading = true;
          switch (self.type) {
            case 'down':
              self._moveY = self._loadingMinHeight;
              break;
            case 'up':
              self._moveY = -self._loadingMinHeight;
              break;
            default:
              break;
          }
          self.showLoading();
          self.loadingFunc();
          self.moving()
        } else {
          self.hidePull();
        }
        movePoint = null;
      }
    })
  }

  //到达顶部
  SimplePullLoading.prototype.atTop = function () {
    var result = false;
    if (this.$inner.scrollTop <= 1) {
      this.$inner.scrollTop == 1;
      result = true;
    }
    return result;
  }

  //到达底部
  SimplePullLoading.prototype.atBottom = function () {
    var result = false;
    if (this.$inner.scrollTop + this.$inner.clientHeight >= this.$inner.scrollHeight - 1) {
      this.$inner.scrollTop = this.$inner.scrollHeight - this.$inner.clientHeight - 1;
      result = true;
    }
    return result;
  }

  //移动
  SimplePullLoading.prototype.moving = function () {
    this.$list.style[transformProperty] = 'translateY(' + this._moveY + 'px)';
    this.$pull.style.height = Math.abs(this._moveY) + 'px';
  }

  //显示提示
  SimplePullLoading.prototype.showTip = function () {
    this.$pull.classList.remove(this._loosenClass)
    this.$pull.classList.remove(this._successClass)
    this.$pull.classList.remove(this._loadingClass)
    this.$pull.classList.add(this._tipClass)
  }

  //显示提示
  SimplePullLoading.prototype.showLoosen = function () {
    this.$pull.classList.remove(this._tipClass)
    this.$pull.classList.remove(this._successClass)
    this.$pull.classList.remove(this._loadingClass)
    this.$pull.classList.add(this._loosenClass)
  }

  //显示加载动画
  SimplePullLoading.prototype.showLoading = function () {
    this.$pull.classList.remove(this._loosenClass)
    this.$pull.classList.remove(this._successClass)
    this.$pull.classList.remove(this._tipClass)
    this.$pull.classList.add(this._loadingClass)
  }

  //显示成功
  SimplePullLoading.prototype.showSuccess = function () {
    var self = this;
    self.$pull.classList.remove(this._loosenClass)
    self.$pull.classList.remove(this._tipClass)
    self.$pull.classList.remove(this._loadingClass)
    self.$pull.classList.add(this._successClass)

    setTimeout(function () {
      self.$pull.style[transitionDurationPro] = self.resultDuration + 's';
      self.$list.style[transitionDurationPro] = self.resultDuration + 's';
      self._moveY = 0;
      self.moving();
    }, self.resultDelay)

    self.$pull.addEventListener(transitionEndEvent, function () {
      self.hidePull();
    })
  }

  //显示拉动刷新组件
  SimplePullLoading.prototype.showPull = function () {
    this.$pull.style.display = this._pullDisplay;
    //禁止滚动
    this.$inner.style.overflowY = 'hidden';
    this._isStart = true;
  }

  //隐藏拉动刷新组件
  SimplePullLoading.prototype.hidePull = function () {
    this._isLoading = false;
    this._isStart = false;
    this._moveY = 0;
    this.$pull.style.display = 'none';
    this.$inner.style.overflowY = 'scroll';
    this.$pull.style[transitionDurationPro] = '0s';
    this.$list.style[transitionDurationPro] = '0s';
    this.$pull.classList.remove(this._loosenClass)
    this.$pull.classList.remove(this._successClass)
    this.$pull.classList.remove(this._tipClass)
    this.$pull.classList.remove(this._loadingClass)
    switch (this.type) {
      case 'down':
        this.$inner.scrollTop = 1;
        break;
      case 'up':
        this.$inner.scrollTop = this.$inner.scrollTop - 1;
        break;
      default:
        break;
    }
    this.moving();
  }

  return SimplePullLoading
})