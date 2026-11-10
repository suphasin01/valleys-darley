export const metadata = { title: "About Us – Valley's Darling" };

// Text and images from Figma frame "about us" (1:2219)
export default function Page() {
  return (
    <div className="supplied-ui"><div className="about">
      <section className="about-intro">
        <img className="about-bows" src="/assets/about/bows.png" alt="" />
        <h1 className="script-title about-title">Enter to the World</h1>
        <p className="about-lead">
          our story began in 2020, with the warm romance that lives in a young girl&apos;s heart and a love for the mood of old film photographs and days gone by. we wanted to pour this feeling into every image and every piece of our jewelry. each piece is soft and feminine, with a touch of playfulness — where sweetness meets a little edge.
        </p>
      </section>

      <div className="page">
        <img id="stories" className="about-hero" src="/assets/about/hero.jpg" alt="a girl resting her arms on a wooden cabinet, wearing the ruffle heart locket" />
        <p className="about-center">
          at our core, we are a blend of creative imagination and careful handcraft, brought together to breathe life into everything we make.
          <br /><br />
          for us, it&apos;s all about how a piece makes you feel when you wear it.
        </p>

        <div className="about-split">
          <div>
            <h2 className="script-title small about-name">The Meaning behind our name</h2>
            <p>valleydarley comes from valley&apos;s darling — a valley beloved by us, and by someone like you. in that world, anything is possible. we are here to hold that space, and to remind you that you already know the way. you will find your own valley.</p>
            <p>that is what valley&apos;s darling is: the distance between a dream and the thing you hold.</p>
          </div>
          <img src="/assets/about/valley.jpg" alt="illustration of a girl hugging a white unicorn in a valley" />
        </div>

        <div className="about-keepsakes">
          <img src="/assets/about/keepsakes.jpg" alt="hands wearing the rosette ribbon mother of pearl ring beside a strand of pearls" />
          <p className="about-quote">“keepsakes of wonder and romance”</p>
        </div>
        <p className="about-center about-craft">
          imagination leads.
          <br /><br />
          craft follows. what arrives in your hands began somewhere only the heart can reach.
        </p>
      </div>

      <section id="packaging" className="about-packaging">
        <div className="page">
          <h2 className="script-title small">The Packaging</h2>
          <p>we handcraft our own jewelry pouches using different materials to match the style of each collection. we only use premium fabrics to make sure your jewelry is both beautifully wrapped and well-protected.</p>
          {/* TODO: packaging photo or video (still a grey placeholder in Figma) */}
          <p className="about-right">that&apos;s why everything from the jewelry itself to the final detail on our packaging — is handcrafted with intention.</p>
        </div>
      </section>

      <section id="where-to-find-us" className="about-where">
        <img src="/assets/about/where.png" alt="Where to find us – at Tres Siam Square Soi 5" />
      </section>
    </div></div>
  );
}
