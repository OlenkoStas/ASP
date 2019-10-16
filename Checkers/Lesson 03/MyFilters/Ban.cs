using Lesson_03.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Lesson_03.MyFilters
{
    public class Ban : ActionFilterAttribute, IActionFilter
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            //если пользователь авторизован и роль "user"
            if (filterContext.HttpContext.User.Identity.IsAuthenticated && filterContext.HttpContext.User.IsInRole("user"))
            {
                var userName = filterContext.HttpContext.User.Identity.Name;
                using (var ctx = new ApplicationDbContext())
                {
                    var userEntity = ctx.Users.First(u => u.UserName == userName);
                    if (userEntity.Ban == true)
                    {
                        filterContext.Result = new RedirectToRouteResult(new System.Web.Routing.RouteValueDictionary {
                                                                            { "controller", "Home" }, { "action","Blocked"} });
                    }
                }
            }
        }
    }
}