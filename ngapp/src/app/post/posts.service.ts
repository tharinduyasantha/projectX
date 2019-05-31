import { Injectable } from "@angular/core";
import { Subject, BehaviorSubject } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { map } from "rxjs/operators";
import { Router } from "@angular/router";

import { Post } from "./post.model";
import { environment } from "../../environments/environment";
import { AuthService } from "../auth/auth.service";

const BACKEND_URL = environment.apiUrl + "/posts/";

@Injectable({ providedIn: "root" })
export class PostsService {
  private posts: Post[] = [];
  private postUpdated = new Subject<{ posts: Post[]; postCount: number }>();

  public authUserListner = new BehaviorSubject<any>(null);
  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {
    this.authUserListner = authService.authUserListner;
  }

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this.http
      .get<{ message: string; posts: any; maxPosts: number }>(
        BACKEND_URL + queryParams
      )
      .pipe(
        map(postData => {
          return {
            posts: postData.posts.map(post => {
              return {
                title: post.title,
                content: post.content,
                id: post._id,
                imagePath: post.imagePath,
                creator: post.creator
              };
            }),
            maxPosts: postData.maxPosts
          };
        })
      )
      .subscribe(transformedPostData => {
        this.posts = transformedPostData.posts;
        this.postUpdated.next({
          posts: [...this.posts],
          postCount: transformedPostData.maxPosts
        });
      });
  }
  testAsnyTask(post: number): Promise<any> {
    const req = this.http.get<any>(
      "https://jsonplaceholder.typicode.com/todos/" + post
    );
    return req.toPromise();
  }

  getPostUpdatedListner() {
    return this.postUpdated.asObservable();
  }

  getPost(id: string) {
    return this.http.get<{
      _id: string;
      title: string;
      content: string;
      imagePath: string;
      creator: string;
    }>(BACKEND_URL + id);
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append("title", title);
    postData.append("content", content);
    postData.append("image", image, title);

    this.http
      .post<{ message: string; post: Post }>(BACKEND_URL, postData)
      .subscribe(responseData => {
        this.router.navigate(["/"]);
      });
  }

  updatedPosts(
    id: string,
    title: string,
    content: string,
    image: File | string
  ) {
    let postData: Post | FormData;
    if (typeof image === "object") {
      postData = new FormData();
      postData.append("id", id);
      postData.append("title", title);
      postData.append("content", content);
      postData.append("image", image, title);
    } else {
      postData = {
        id,
        title,
        content,
        imagePath: image,
        creator: null
      };
    }
    this.http.put(BACKEND_URL + id, postData).subscribe(response => {
      this.router.navigate(["/"]);
    });
  }

  deletePost(postId: string) {
    const headers = new HttpHeaders({
      Authorization: "Bearer " + this.authUserListner.value.token
    });
    return this.http.delete(environment.apiUrl + "/posts/" + postId, {
      headers: headers
    });
  }
}
