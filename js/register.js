(function($) {
  var error = {
    username: {
      1: '用户名不能为空'
    },
    phone: {
      1: '手机号不能为空',
      2: '手机号格式不正确',
      3: '手机号已存在，请直接登录'
    },
    security: {
      1: '验证码不能为空'
    },
    idcard: {
      1: '身份证不能为空',
      2: '身份证格式不正确',
    },
    password: {
      1: '登录密码不能为空',
      2: '确认密码不能为空',
      3: '两次密码不一致，请重新输入',
      4: '密码最少为6位'
    }
  };
  var errorArr = [];
  var securityDisabled = true;
  var totalCount = 60;   
  var btnValid = true;
  var appkey = '';
  var share_id = '';

  function init() {
    getAppkey();
    getShareId();
  }
 
  function getAppkey() {
    var cookie = getValue(document.cookie, 'token');
    console.log('cookie ', cookie);
    appkey = cookie ? md5('xiejia-admin_' + cookie) : '';
  }

  function getShareId() {
    var search = location.search.slice(1);
    share_id = getValue(search, 'share_id');
    if (share_id) $('.shareid-container').hide();
  }

  function getValue(str, c_name) {
    if (str.length > 0) {
      start = str.indexOf(c_name + "=")
      if (start != -1) { 
        start = start + c_name.length+1 
        end = str.indexOf(";", start)
        if (end == -1) end = str.length;
        return str.substring(start,end)
      } 
    }
    return ""
  }

  function setRrrorInfo(type, index) {
    if (type && index) {
      $('.error-info').html(error[type][index]).show();
      errorArr.push(type + '_' + index);
    }
  }
  
  function removeErrorInfo() {
    $('.error-info').html('').hide();
  }

  function usernameBlur() {
    var value = $('.username').val();
    if (!value) {
      setRrrorInfo('username', 1);
    } else {
      removeErrorInfo();
    }
  }

  function checkPhone(value) {
    var newValue = value || $('.phone').val();
    return $.ajax({
      url: 'http://test.00981.net/xiejia/index.php?s=/Api/',
      data: { phone: newValue },
    })
    .done(function(res) {
      new Promise(function(resolve, reject) {
        if (res.state_code == 0) {
          setRrrorInfo('phone', 3);
          securityDisabled = true;
          btnValid = true;
          resolve();
        } else {
          weui.alert(res.error_msg);
          securityDisabled = false;
          resolve();
        }
      })
    })
    .fail(function(res) {
      weui.alert(res.error_msg);
      console.log( "checkPhone Request failed: " + res );
    });
  }

  function phoneBlur(type) {
    var reg = new RegExp('^((13[0-9])|(14[5|7])|(15([0-3]|[5-9]))|(18[0,5-9]))\\d{8}$');
    var value = $('.phone').val();
    if (!value) {
      setRrrorInfo('phone', 1);
    } else {
      if (!reg.test(value)) {
        setRrrorInfo('phone', 2);
      } else {
        removeErrorInfo();
        !type && checkPhone(value);
      }
    }
  }

  function securityBlur() {
    var value = $('.security-input').val();
    if (!value) {
      setRrrorInfo('security', 1);
    } else {
      removeErrorInfo();
    }
  }

  function idcardBlur() {
    var idcardReg = /(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9|X|x]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}[0-9|X|x]$)/
    var value = $('.idcard').val();
    if (!value) {
      setRrrorInfo('idcard', 1);
    } else {
      console.log(idcardReg.test(value))
      if (!idcardReg.test(value)) {
        setRrrorInfo('idcard', 2);
      } else {
        removeErrorInfo();
      }
    }
  }


  function passwordBlur () {
    var value = $('.password').val();
    if (!value) {
      setRrrorInfo('password', 1);
    } else {
      if (value.length < 6) {
        setRrrorInfo('password', 4);
      } else {
        var confirmPassword = $('.confirm-password').val();
        if (confirmPassword && confirmPassword != value) {
          setRrrorInfo('password', 3);
        } else {
          removeErrorInfo();
        }
      }
    }
  }

  function confirmPasswordBlur() {
    var value = $('.confirm-password').val();
    if (!value) {
      setRrrorInfo('password', 2);
    } else {
      if (value.length < 6) {
        setRrrorInfo('password', 4);
      } else {
        var password = $('.password').val();
        if (password && password != value) {
          setRrrorInfo('password', 3);
        } else {
          removeErrorInfo()
        }
      }
    }
  }

  function setCountDown() {
    setTime();
    function setTime() {
      if (totalCount < 0) {
        $('.security-code').html('发送验证码');
        totalCount = 10;
        btnValid = true;
      } else {
        btnValid = false;
        $('.security-code').html('重新发送( ' + totalCount +'s )');
        totalCount--;
        setTimeout(function() {setTime()}, 1000)
      }
    }
  }

  function getImgcode() {
    $('.mask-container').show();
    $('.mask-code').val('');
    $.ajax({
      url: 'http://test.00981.net/xiejia/index.php?s=/Api/',
      success: function(res) {
        if (res.state_code == 0) {
          $('.weui-vcode-img').attr('src', '../images/bg.png');
        } else {
          weui.alert(res.error_msg);
        }
      },
      error: function(res) {
        weui.alert(res.error_msg);
      }
    })
  }
  
  function getSecurityCode() {
    btnValid = false;
    checkPhone().then(
      res => {
        if (securityDisabled) return;
        var value = $('.phone').val();
        $.ajax({
          url: 'http://test.00981.net/xiejia/index.php?s=/Api/User/randomCode',
          data: { 
            mobile: value,
            type: 0 
          }
        })
        .done(function(res) {
          if (res.state_code == 0) {
            setCountDown()
          } else {
            weui.alert(res.error_msg);
          }
        })
        .fail(function(res) {
          weui.alert(res.error_msg);
        });
      }
    )
  }

  function onClickMaskConfirm() {
    var code = $('.mask-code').val();
    $.ajax({
      url: 'http://test.00981.net/xiejia/index.php?s=/Api/',
      data: {
        code: code
      },
      success: function(res) {
        if (res.state_code == 0) {
          getSecurityCode();
        } else {
          weui.alert(res.error_msg);
        }
      },
      error: function(res) {
        weui.alert(res.error_msg);
      }
    })
  }

  function onClickMaskCancel() {
    $('.mask-container').hide();
    $('.mask-code').val('');
  }
  
  function register(data) {
    $.ajax({
      url: "http://test.00981.net/xiejia/index.php?s=/Api/User/createUserInfo",
      method: "POST",
      data: data
    })
    .done(function( res ) {
      if (res.state_code == 0) {
        location.href="mine.html";
      } else {
        weui.alert(res.error_msg);
      }
    })
    .fail(function(res) {
      weui.alert(res.error_msg);
    });
  }

  function formatParams() {
    var username = $('.username').val(),
    phone = $('.phone').val(),
    code = $('.security-input').val(),
    password = $('.password').val(),
    role_type = 1,
    appkey = appkey,
    share_id = share_id ? share_id : $('.invite_code').val();
    var data = {
      username: username,
      phone: phone,
      code: code,
      password: password,
      role_type: role_type,
      appkey: appkey,
    };
    share_id && (data.share_id = share_id);
    return data;
  }
  
  function onSubmitClick() {
    errorArr = [];
    usernameBlur()
    phoneBlur(true)
    securityBlur()
    idcardBlur()
    passwordBlur()
    confirmPasswordBlur()
    if (errorArr.length > 0) {
      var type = errorArr[0].split('_')[0];
      var index = errorArr[0].split('_')[1];
      setRrrorInfo(type, index);
      return;
    } else {
      var data = formatParams();
      register(data)
    }
  }

  $('.phone').blur(function() { phoneBlur() })

  $('.security-input').blur(function() { securityBlur() })

  $('.mask-cancel').click(function() { onClickMaskCancel() })

  $('.mask-confirm').click(function() { onClickMaskConfirm() })

  $('.refresh-container').click(function() { getImgcode() })
  
  $('.idcard').blur(function() { idcardBlur() })

  $('.password').blur(function() { passwordBlur() })

  $('.confirm-password').blur(function() { confirmPasswordBlur() })

  $('.security-code').click( function() { btnValid && getImgcode() })

  $('.submit-btn').click(function() { onSubmitClick() })

  init();
  
})(jQuery)