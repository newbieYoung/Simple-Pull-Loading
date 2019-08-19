/**
 * Created by newyoung on 2019/8/14.
 */

(function(factory) {
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
  })(function(Prefix) {
    var transformProperty = Prefix.prefix('transform')
  
    /**
     */
    function SimplePullLoading(config) {
      if (!config || typeof config !== 'object') {
        console.error('参数异常')
        return
      }

      this.$container = config.$container;
      this.$list = config.$list;
      
    }
   
    return SimplePullLoading
  })
  