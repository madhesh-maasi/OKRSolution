
export class localization {

  static allText = {
    "Mydetail_EN": "My Details",
    "Mydetail_CH": "我的细节",
    "DepartmentSummary_EN": "Department Summary",
    "DepartmentSummary_CH": "部门总结",
    "CompanySummary_EN": "Company Summary",
    "CompanySummary_CH": "公司简介",
    "AdminFunctions_EN": "Admin Functions",
    "AdminFunctions_CH": "管理员功能",
  };

  static getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  static getText(property) {
    var language = this.getCookie('language');
    return this.allText[property + "_" + language];
  }

}