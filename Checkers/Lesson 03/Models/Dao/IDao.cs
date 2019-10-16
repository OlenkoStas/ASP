using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lesson_03.Models.Dao
{
    interface IDao<T> where T : class
    {
        IList<T> GetAll(Func<T, bool> predicate = null);
        void Add(T newItem);
        void Delete(int id);
    }
}
