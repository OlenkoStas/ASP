using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(Lesson_03.Startup))]
namespace Lesson_03
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
