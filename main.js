import 'normalize.css';
import './style.scss';
import Navigo from 'navigo';
import { Header } from './modules/Header/Header';
import { Main } from './modules/Main/Main';
import { Footer } from './modules/Footer/Footer';
import { ProductList } from './modules/ProductList/ProductList';
import { ApiService } from './services/ApiService';
import { Catalog } from './modules/Catalog/Catalog';
import { FavouriteService } from './services/StorageService';
import { Pagination } from './features/Pagination/Pagination';
import { BreadCrumbs } from './features/BreadCrumbs/BreadCrumbs';
import { ProductCard } from './modules/ProductCard/ProductCard';
import { productSlider } from './features/ProductSlider/productSlider';
import { Cart } from './modules/Cart/Cart';





export const router = new Navigo('/', { linksSelector: 'a[href^="/"]' });

const init = () => {
  const api = new ApiService();
  const header = new Header();
  header.mount();
  new Main().mount();
  new Footer().mount();


  router.on("/", async () => {
    new Catalog().mount(new Main().element);
    const products = await api.getProducts();
    new ProductList().mount(new Main().element, products);
    router.updatePageLinks();

  }, {

    leave(done) {
      new ProductList().unmount();
      new Catalog().unmount();
      done();
    },
    already(match) {
      match.route.handler(match);
    },
  })

    .on("/category",
      async ({ params: { slug, page = 1 } }) => {
        (await new Catalog().mount(new Main().element)).setActiveLink(slug);
        const { data: products, pagination } = await api.getProducts({ category: slug, page: page, });

        new BreadCrumbs().mount(new Catalog().element, [{ text: slug }]);
        new ProductList().mount(new Main().element, products, slug);

        if (pagination.totalProducts > pagination.limit) {
          new Pagination().mount(new ProductList().ContainerElement).update(pagination);

        }
        router.updatePageLinks();

      },
      {
        leave(done) {
          new BreadCrumbs().unmount();
          new ProductList().unmount();
          new Catalog().unmount();
          done();
        },

        already(match) {
          match.route.handler(match);
        }
      },

    )
    .on("/favourite",
      async ({ params }) => {
        new Catalog().mount(new Main().element);
        const favourite = new FavouriteService().get();
        const { data: product, pagination } = await api.getProducts({ list: favourite.join(','), page: params?.page || 1 });

        new BreadCrumbs().mount(new Main().element, [{ text: 'Favourites' }]);
        new ProductList().mount(new Main().element, product, "Favourites", 'Please add something in favourite...');

        if (pagination?.totalProducts > pagination?.limit) {
          new Pagination().mount(new ProductList().ContainerElement).update(pagination);

        }
        router.updatePageLinks();

      },
      {
        leave(done) {
          new BreadCrumbs().unmount();
          new ProductList().unmount();
          new Catalog().unmount();
          done();
        },
        already(match) {
          match.route.handler(match);
        }
      },

    )
    .on("/search",
      async ({ params: { q } }) => {

        new Catalog().mount(new Main().element);
        const { data: product, pagination } = await api.getProducts({ q, });

        new BreadCrumbs().mount(new Main().element, [{ text: 'Search' }]);
        new ProductList().mount(new Main().element, product, `Search: ${q}`, `Not found by your request "${q}"`);
        if (pagination?.totalProducts > pagination?.limit) {
          new Pagination().mount(new ProductList().ContainerElement).update(pagination);

        }
        router.updatePageLinks();
      },
      {
        leave(done) {
          new BreadCrumbs().unmount();
          new ProductList().unmount();
          new Catalog().unmount();
          done();
        },
        already(match) {
          match.route.handler(match);
        }
      },

    )
    .on("/product/:id", async (obj) => {

      new Catalog().mount(new Main().element);
      const data = await api.getProductById(obj.data.id);
      console.log('data: ', data);
      new BreadCrumbs().mount(new Main().element, [
        {
          text: data.category,
          href: `/category?slug=${data.category}`
        },
        {
          text: data.name,
        },
      ]);
      new ProductCard().mount(new Main().element, data);
      productSlider();
    }, {
      leave(done) {
        new Catalog().unmount();
        new BreadCrumbs().unmount();
        new ProductCard().unmount();
        done();
      },
    })
    .on("/cart", async () => {
      const cartItems = await api.getCart();
      new Cart().mount(new Main().element, cartItems, 'The cart is empty, Please add goods!')
    }, {
      leave(done) {
        new Cart().unmount();

        done();
      },
    })
    .on("/order/:id", ({ data: { id } }) => {
      console.log(`order: ${id}`);

      api.getOrder(id).then(data => {
        console.log(data);
      });
    })
    .notFound(() => {

      new Main().element.innerHTML = `
      <h2>Page not found!</h2>
      <p>In 5 minutes  you willl be redirected <a href="/"> on the Main page!</a></p>
      `;

      setTimeout(() => {
        new Main().element.innerHTML = '';
        router.navigate("/");

      }, 5000);


    })

  router.resolve();



  

  api.getCart().then((data) => {
    header.changeCount(data.totalCount); // безопасно — header уже смонтирован
  });
}

init();






