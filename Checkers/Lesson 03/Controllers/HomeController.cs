using Lesson_03.Models;
using Lesson_03.Models.Dao;
using Lesson_03.MyFilters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace GameOnline.Controllers
{
    public class HomeController : Controller
    {
        private static DaoGamesArhive _dao = new DaoGamesArhive();
        
        [Ban]
        public ActionResult Index()
        {
            if (User.IsInRole("admin"))
                return RedirectToAction("Index", "Admin");
            return View(new InvitationGameViewModel());
        }
        [Authorize]
        public ActionResult Blocked()
        {
            return View();
        }
        [Ban]
        [Authorize]
        public ActionResult Details(int id)
        {
            return View(_dao.GetById(id));
        }
        [Ban]
        [Authorize]
        public ActionResult Arhive()
        {
            return View(_dao.GetAllByNickName(User.Identity.Name));
        }
    }
}