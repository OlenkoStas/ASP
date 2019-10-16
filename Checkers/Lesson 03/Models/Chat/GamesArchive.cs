using Lesson_03.Models.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Lesson_03.Models.Chat
{
    public class GamesArchive
    {
        [HiddenInput(DisplayValue = false)]
        public int Id { get; set; }
        [Display (Name ="Игрок")]
        public string PlayerOne { get; set; }
        [Display(Name = "Игрок")]
        public string PlayerTwo { get; set; }
        [Display(Name = "Дата игры")]
        public DateTime Date { get; set; }
        [Display(Name = "Выиграл")]
        public string Winner { get; set; }
        [Display(Name = "Ходы")]
        public string Moves { get; set; }
    }
}