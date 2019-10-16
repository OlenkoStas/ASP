using Lesson_03.Models.Chat;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Lesson_03.Models.Dao
{
    public class DaoGamesArhive : IDao<GamesArchive>
    {
        private ApplicationDbContext ctx;

        public void Add(GamesArchive newItem)
        {
            using (ctx = new ApplicationDbContext())
            {
                ctx.GamesArchive.Add(newItem);
                ctx.SaveChanges();
            }
        }

        public void Delete(int id)
        {
            throw new NotImplementedException();
        }

        public IList<GamesArchive> GetAll(Func<GamesArchive, bool> predicate = null)
        {
            using (ctx = new ApplicationDbContext())
            {
                if (predicate == null)
                    return ctx.GamesArchive.ToList();
                else
                {
                    return ctx.GamesArchive.Where(predicate).ToList();
                }

            }
        }

        public IList<GamesArchive> GetAllByNickName(string name)
        {
            using (ctx = new ApplicationDbContext())
            {
                return ctx.GamesArchive.Where(x => x.PlayerOne == name || x.PlayerTwo == name).ToList();
            }
        }
        public GamesArchive GetById(int id)
        {
            using (ctx = new ApplicationDbContext())
            {
                return ctx.GamesArchive.Find(id);
            }
        }
    }
}