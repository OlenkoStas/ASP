using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace Lesson_03.Models.Enums
{
    public enum GameType
    {
        [Display(Name = "Классические")]
        Classic = 1,
        [Display(Name = "Русские")]
        Russian,
        [Display(Name = "Поддавки")]
        Giveaways
    }
    /*public enum GameResult
    {
        Draw = 0,
        PlayerOneWin,
        PlayerTwoWin
    }*/
}