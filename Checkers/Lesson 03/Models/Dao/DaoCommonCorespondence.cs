using Lesson_03.Models.Chat;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Lesson_03.Models.Dao
{
    public class DaoCommonCorespondence : IDao<CommonСorrespondence>
    {
        private ApplicationDbContext ctx;
        public void Add(CommonСorrespondence newItem)
        {
            using (ctx = new ApplicationDbContext())
            {
                ctx.CommonСorrespondence.Add(newItem);
                ctx.SaveChanges();
            }
        }

        public void Delete(int id)
        {
            throw new NotImplementedException();
        }

        public IList<CommonСorrespondence> GetAll(Func<CommonСorrespondence, bool> predicate = null)
        {
            using (ctx = new ApplicationDbContext())
            {
                if (predicate == null)
                    return ctx.CommonСorrespondence.ToList();
                else
                {
                    return ctx.CommonСorrespondence.Where(predicate).ToList();
                }

            }
        }
    }
}