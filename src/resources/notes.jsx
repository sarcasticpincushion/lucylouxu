import lucyVanPelt from './images/lucy-van-pelt.jpg';

// Notes shown in each citation's popover. Each value can be a plain string
// (where "\n" becomes a line break) OR JSX for rich content, e.g.:
//   2: (
//     <>
//       See my <a href="https://..." target="_blank">portfolio↗</a>.
//       <img src={someImage} alt="a nail set" />
//       <p>A second paragraph.</p>
//     </>
//   ),
const notes = {
  1: 'Think falling through the sky with an umbrella... in a surreal Magritte sort of way.',
  2: (
    <>
      I wasn't allowed to paint my nails growing up because I did ballet for 10
      years, so summer vacation was even more alluring because I could paint my
      nails with my Kohl's set of 4 nail polishes. Cut to college and having
      some spending money, I bought myself gel polish and have been creating
      micro-art for years now. See my{' '}
      <a
        href="https://www.instagram.com/bonknail"
        target="_blank"
        rel="noreferrer"
      >
        portfolio↗
      </a>{' '}
      here. My work has also been published{' '}
      <a
        href="https://secretrisoclub.com/Superbloom-Nails"
        target="_blank"
        rel="noreferrer"
      >
        here↗
      </a>{' '}
      and{' '}
      <a
        href="https://www.vqpalette.com/products/pre-order-vol-2-girlhood_v"
        target="_blank"
        rel="noreferrer"
      >
        here↗
      </a>
      !
    </>
  ),
  3: 'Imagine this: food crawl 12-9PM, a bakery to start, with scissors to divide/share 2 (different flavored) donuts between 3 people, 3 food carts, a pizza stop, finish with a burger and cookie.',
  4: 'I like a good science fiction. Re-reading the full Harry Potter series every 1-2 years is also expected of me.',
  5: 'I have a little chrome Nikon Coolpix S01, the Konica Minolta Dimage X1, and my beloved limited edition chrome Olympus Mju I film camera that I received as a gift (I accidentally made it a point to have all chrome cameras).',
  6: (
    <>
      <img src={lucyVanPelt} alt="Lucy Van Pelt" />
      Despite Lucy Van Pelt's iconic self, I was not named after her (I did grow
      up with the Peanuts collection of comics from Costco though).
      <br />
      <br />
      I was actually named after Lucy in “I Love Lucy.”
    </>
  ),
};

export default notes;
