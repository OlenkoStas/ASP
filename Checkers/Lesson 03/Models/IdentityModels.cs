using System.Data.Entity;
using System.Security.Claims;
using System.Threading.Tasks;
using Lesson_03;
using Lesson_03.Models.Chat;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;

namespace Lesson_03.Models
{
    // В профиль пользователя можно добавить дополнительные данные, если указать больше свойств для класса ApplicationUser. Подробности см. на странице https://go.microsoft.com/fwlink/?LinkID=317594.
    public class ApplicationUser : IdentityUser
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Country { get; set; }
        public string City { get; set; }
        public bool Ban { get; set; }

        public async Task<ClaimsIdentity> GenerateUserIdentityAsync(UserManager<ApplicationUser> manager)
        {
            // Обратите внимание, что authenticationType должен совпадать с типом, определенным в CookieAuthenticationOptions.AuthenticationType
            var userIdentity = await manager.CreateIdentityAsync(this, DefaultAuthenticationTypes.ApplicationCookie);
            // Здесь добавьте утверждения пользователя
            return userIdentity;
        }
    }

    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public virtual DbSet<CommonСorrespondence> CommonСorrespondence { get; set; }
        public virtual DbSet<GamesArchive> GamesArchive { get; set; }

        static ApplicationDbContext()
        {
            Database.SetInitializer(new MyDbInitializer());
        }

        public ApplicationDbContext()
            : base("DefaultConnection", throwIfV1Schema: false)
        {
        }

        public static ApplicationDbContext Create()
        {
            return new ApplicationDbContext();
        }
    }

    public class MyDbInitializer : CreateDatabaseIfNotExists<ApplicationDbContext>
    {
        protected override void Seed(ApplicationDbContext context)
        {
            var userManager = new ApplicationUserManager(new UserStore<ApplicationUser>(context));
            var roleManager = new RoleManager<IdentityRole>(new RoleStore<IdentityRole>(context));

            var r1 = new IdentityRole("admin");
            var r2 = new IdentityRole("user");

            roleManager.Create(r1);
            roleManager.Create(r2);

            var admin = new ApplicationUser
            {
                Email = "admin@gmail.com",
                UserName = "admin"
            };

            string psw = "111111";

            var result = userManager.Create(admin, psw);

            if (result.Succeeded)
                userManager.AddToRole(admin.Id, r1.Name);


            context.SaveChanges();
        }
    }
}