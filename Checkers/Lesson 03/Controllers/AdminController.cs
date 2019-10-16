using Lesson_03.Models;
using Microsoft.AspNet.Identity.Owin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace GameOnline.Controllers
{
    [Authorize(Roles = "admin")]
    public class AdminController : Controller
    {

        public ActionResult Index()
        {
            using (var ctx = new ApplicationDbContext())
            {
                return View(ctx.Users.AsEnumerable().Select(u => new UserViewModel
                {
                    Id = u.Id,
                    NickName = u.UserName,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    City = u.City,
                    Country = u.Country,
                    Email = u.Email,
                    Ban = u.Ban
                }).ToList());
            }
        }

        public ActionResult ChangeBanStatus(string id)
        {
            if (!string.IsNullOrEmpty(id))
            {
                using (var ctx = new ApplicationDbContext())
                {
                    var u = ctx.Users.FirstOrDefault(user => user.Id == id);
                    if (u != null)
                        return View(new UserViewModel
                        {
                            Id = u.Id,
                            NickName = u.UserName,
                            FirstName = u.FirstName,
                            LastName = u.LastName,
                            City = u.City,
                            Country = u.Country,
                            Email = u.Email,
                            Ban = u.Ban
                        });
                }
            }
            return RedirectToAction("index");
        }

        [HttpPost]
        public ActionResult ChangeBanStatus(UserViewModel user)
        {
            using (var ctx = new ApplicationDbContext())
            {
                var x = ctx.Users.Find(user.Id);
                if (x != null)
                {
                    x.Ban = user.Ban;
                    ctx.SaveChanges();
                }
                return RedirectToAction("index");
            }
        }

        public ActionResult Details(string id)
        {
            if (!string.IsNullOrEmpty(id))
            {
                using (var ctx = new ApplicationDbContext())
                {
                    var user = ctx.Users.FirstOrDefault(u => u.Id == id);
                    if (user != null)
                    {
                        return View(user);
                    }
                }
            }
            return RedirectToAction("index");
        }

        public ActionResult Delete(string id)
        {
            if (!string.IsNullOrEmpty(id))
            {
                using (var ctx = new ApplicationDbContext())
                {
                    var user = ctx.Users.FirstOrDefault(u => u.Id == id);
                    if (user != null)
                    {
                        ctx.Entry(user).State = System.Data.Entity.EntityState.Deleted;
                        ctx.SaveChanges();
                    }
                }
            }
            return RedirectToAction("index");
        }
    }
}