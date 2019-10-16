using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using Lesson_03.Models;
using Lesson_03.Models.Chat;
using Lesson_03.Models.Dao;
using Lesson_03.Models.Enums;
using Microsoft.AspNet.SignalR;
using Newtonsoft.Json;
using Microsoft.AspNet.SignalR.Hubs;

namespace Lesson_03.Hubs
{
    public class ChatHub : Hub
    {
        private static List<InvitationGameViewModel> _invitations = new List<InvitationGameViewModel>();
        private static List<CommonСorrespondence> _commonСorrespondences = new List<CommonСorrespondence>();
        private static DaoGamesArhive _dao = new DaoGamesArhive();
        private static DaoCommonCorespondence _daoCorresp = new DaoCommonCorespondence();

        static ChatHub()
        {
            _commonСorrespondences.AddRange(_daoCorresp.GetAll());
        }
        public override Task OnConnected()
        {
            Clients.Caller.connected(_commonСorrespondences, _invitations);
            return base.OnConnected();
        }
        /// <summary>
        /// При выходе клиента удаляет из списка его приглашения
        /// </summary>
        /// <param name="stopCalled"></param>
        /// <returns></returns>
        public override Task OnDisconnected(bool stopCalled)
        {
            var invs = _invitations.Where(i => i.ConnectionId == Context.ConnectionId).ToList();
            _invitations.RemoveAll(i => i.ConnectionId == Context.ConnectionId);
            //удаление на клиентах
            Clients.All.removeInvitations(invs);
            return base.OnDisconnected(stopCalled);
        }
        /// <summary>
        /// Создание приглашения на игру
        /// </summary>
        public void CreateGame(string color,int min,int sec,GameType type,bool autoSearch)
        {
            var invitation = new InvitationGameViewModel
            {
                Color = color,
                GameTime = new TimeSpan(0, min, sec),
                Type = type,
                ConnectionId=Context.ConnectionId,
                Creator=Context.User.Identity.Name
            };
            //Если точно такое же предложение есть от того же пользователя то игнорируем его
            if (_invitations.Any(i => i.Hash == invitation.Hash)) return;

                //показ в списке
            if (autoSearch)
                {
                    var game = _invitations.FirstOrDefault(i => i.Color != invitation.Color && i.Creator != invitation.Creator && i.Type == invitation.Type && i.GameTime == invitation.GameTime);
                    if(game!=null)
                    {
                        //соединяем не добавляя в список
                        Clients.Client(Context.ConnectionId).acceptInvitation(game,null);
                        //_invitations.Remove(game);
                        return;
                    }
                }
            //добавление в список
            _invitations.Add(invitation);
            Clients.Others.addNewInvitation(invitation);
        }
        /// <summary>
        /// Принимает приглашение на игру и отправляет приглашающему,ID принимающего
        /// </summary>
        /// <param name="invitation">Приглашающий</param>
        public void Apply(object invitation)
        {
            var inv= JsonConvert.DeserializeObject<InvitationGameViewModel>(invitation.ToString());
            //если есть в списке то удаляем
            var result = _invitations.FirstOrDefault(g => g.Hash==inv.Hash/*g.ConnectionId == inv.ConnectionId && g.Type == inv.Type && g.Color == inv.Color*/);
            if (result != null)
            {
                _invitations.Remove(result);
                Clients.AllExcept(inv.ConnectionId).removeInvitation(result.Hash/*result.ConnectionId*/);
            }

            Clients.Client(inv.ConnectionId).bridgeBilding(invitation,Context.ConnectionId, Context.User.Identity.Name);
        }
        /// <summary>
        /// Рассылка сообщения только участника игры (можно сделать и зрителям)
        /// </summary>
        /// <param name="msg"></param>
        public void PrivateChat(string msg,string apponentId,string from)
        {
            Clients.Clients(new List<string> { Context.ConnectionId, apponentId }).onPrivateChat(msg, from);
        }
        /// <summary>
        /// Общий чат
        /// </summary>
        /// <param name="msg">Сообщение</param>
        public void CommonChat(string msg,string from)
        {
            _commonСorrespondences.Add(new CommonСorrespondence { Message=msg,Sender=from });
            _daoCorresp.Add(new CommonСorrespondence { Message = msg, Sender = from });
            Clients.All.onCorrespondence(from, msg);
        }
        /// <summary>
        /// Передача хода сопернику
        /// </summary>
        /// <param name="apponentId">Соперник</param>
        public void Next(string apponentId)
        {
            Clients.Client(apponentId).nextTurn();
        }
        /// <summary>
        /// Показ хода сопернику
        /// </summary>
        /// <param name="apponentId">Соперник</param>
        /// <param name="from">Откуда</param>
        /// <param name="to">Куда</param>
        public void Change(string apponentId,object from,object to)
        {
            Clients.Client(apponentId).change(from,to);
        }

        public void GameOver(string rivalId,string winnerNickName,bool iWin,string history)
        {
              Clients.Client(rivalId).gameOver(iWin==true?false:true);
              Clients.Client(Context.ConnectionId).gameOver(iWin==true?true:false);
            if (history != "" && iWin == true)
            {
                _dao.Add(new GamesArchive
                {
                    Date = DateTime.Now,
                    Moves = history,
                    PlayerOne = winnerNickName,
                    PlayerTwo = Context.User.Identity.Name,
                    Winner = iWin ? Context.User.Identity.Name : winnerNickName
                });
            }
        }
        public void Draw(string rivalId, string rivalNickName, string history)
        {
            if (history != "")
            {
                _dao.Add(new GamesArchive
                {
                    Date = DateTime.Now,
                    Moves = history,
                    PlayerOne = rivalNickName,
                    PlayerTwo = Context.User.Identity.Name,
                    Winner = "Ничья"
                });
            }
        }
    }
}