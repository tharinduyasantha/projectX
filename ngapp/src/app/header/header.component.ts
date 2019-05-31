import { Component, OnInit, OnDestroy } from "@angular/core";
import { AuthService } from "../auth/auth.service";
import { Subscription, BehaviorSubject } from "rxjs";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"]
})
export class HeaderComponent implements OnInit, OnDestroy {
  private authListnerSubs: Subscription;
  user: any = null;

  public authUserListner = new BehaviorSubject<any>(null);
  constructor(private authService: AuthService) {
    this.authUserListner = authService.authUserListner;
    this.authUserListner.subscribe(data => {
      console.log(data);
      if (data == null) {
        this.user = null;
      } else {
        this.user = data.user;
      }
    });
  }

  ngOnInit() {}

  onLogout() {
    this.authService.logout();
  }

  ngOnDestroy() {
    this.authListnerSubs.unsubscribe();
  }
}
