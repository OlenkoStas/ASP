using Lesson_03.Models.Enums;
using System;
using System.ComponentModel.DataAnnotations;

namespace Lesson_03.Models
{

    public class InvitationGameViewModel
    {
        [Display(Name = "Цвет шашки",GroupName ="color")]
        public string Color { get; set; }

        [DataType(DataType.Time)]
        [Display(Name ="Время игры")]
        [Required]
        public TimeSpan GameTime { get; set; }

        [Display(Name ="Тип игры",GroupName ="gameType")]
        public GameType Type { get; set; }

        public string ConnectionId { get; set; }
        public string Creator { get; set; }
        
        private int _hash;
        //Нужно для уникальности,будет добавляться к ID ссылки на игру
        public int Hash {
            get
            {
                return Color.GetHashCode() + GameTime.GetHashCode() + Type.GetHashCode() + ConnectionId.GetHashCode();
            }
            private set
            {
                _hash = value;
            }
        }
    }
}