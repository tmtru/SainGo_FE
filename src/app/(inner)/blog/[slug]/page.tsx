"use client"
import HeaderOne from "@/components/header/HeaderOne";
import FooterOne from "@/components/footer/FooterOne";
import Posts from "@/data/Posts.json"; // JSON mình chuẩn bị
import { useParams } from 'next/navigation';

export default function Home() {
  const { slug } = useParams(); // Lấy slug từ URL
  const blogPost = Posts.find(post => post.slug === slug);

  if (!blogPost) {
    return (
      <div className="demo-one min-h-screen flex items-center justify-center bg-gray-50">
        <h1 className="text-xl font-semibold text-red-600 p-8 bg-white shadow-lg rounded-xl">
          Bài viết "{slug}" không tìm thấy, Man!
        </h1>
      </div>
    );
  }

  // Tạo tên tác giả cho comment giả định
  const commentAuthor = blogPost.author.split(' ')[0] + ' Fan';

  return (
    <div className="demo-one">
      <HeaderOne />

      <div className="blog-sidebar-area rts-section-gap">
        <div className="container">
          <div className="row">
            {/* Blog Content */}
            <div className="col-lg-8 order-lg-1 order-md-2 order-sm-2 order-2">
              <div className="blog-details-area-1">
                {/* Banner */}
                <div className="thumbnail">
                  <img
                    src={`/assets/images/blog/${blogPost.bannerImg}`}
                    alt={blogPost.title}
                  />
                </div>

                {/* Body */}
                <div className="body-content-blog-details">
                  <div className="top-tag-time">
                    <div className="single">
                      <i className="fa-solid fa-clock" />
                      <span>{blogPost.publishedDate}</span>
                    </div>
                    <div className="single">
                      <i className="fa-solid fa-folder" />
                      <span>{blogPost.category}</span>
                    </div>
                  </div>

                  <h1 className="title">{blogPost.title}</h1>

                  {/* Intro + Paragraph 1 */}
                  <p className="disc">{blogPost.intro}</p>
                  <p className="disc">{blogPost.paragraph1}</p>

                  {/* Quote nếu có */}
                  {blogPost.quote && (
                    <p className="quote">{blogPost.quote}</p>
                  )}

                  {/* Gallery ảnh nếu có */}
                  {blogPost.images && blogPost.images.length > 0 && (
                    <div className="row mb-6">
                      {blogPost.images.map((img, idx) => (
                        <div className="col-lg-6 mb-3" key={idx}>
                          <div className="thumbnail-row-iamge">
                            <img src={`/assets/images/blog/${img}`} alt={`image-${idx}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Paragraph 2 + Conclusion */}
                  <p className="disc">{blogPost.paragraph2}</p>
                  <p className="disc font-semibold">{blogPost.conclusion}</p>

                  {/* Tags */}
                  <div className="tag-social-share-wrapper-area-wrapper mt-6">
                    <div className="tags-area">
                      <span>Tags</span>
                      {blogPost.category.split(' ').slice(0, 3).map((tag, idx) => (
                        <button
                          key={idx}
                          className="bg-lime-100 text-lime-700 px-4 py-1 text-sm rounded-full mr-2 hover:bg-lime-500 hover:text-white transition-colors duration-300 shadow-sm"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Author Info */}
                  <div className="blog-details-author mt-8">
                    <div className="thumbnail">
                      <img src="/assets/images/blog/01.png" alt="" />
                    </div>
                    <div className="author-information">
                      <span>Author</span>
                      <h5 className="title">{blogPost.author}</h5>
                      <p>Chia sẻ kiến thức và kinh nghiệm về {blogPost.category}…</p>
                      <div className="social">
                        <ul>
                          <li><a href="#"><i className="fa-brands fa-dribbble" /></a></li>
                          <li><a href="#"><i className="fa-brands fa-facebook-f" /></a></li>
                          <li><a href="#"><i className="fa-brands fa-instagram" /></a></li>
                        </ul>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Sidebar */}
            {/* Bạn có thể bật lại sidebar ở đây nếu muốn */}
          </div>
        </div>
      </div>

      <FooterOne />
    </div>
  );
}
