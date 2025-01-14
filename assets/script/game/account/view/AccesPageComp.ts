import { _decorator, Component, Label, Button } from "cc";
import { oops } from "db://oops-framework/core/Oops";
import { UIID } from "../../common/config/GameUIConfig";
import { VM } from "db://oops-framework/libs/model-view/ViewModel";
import type { HttpReturn } from "db://oops-framework/libs/network/HttpRequest";
import { format } from "db://assets/libs/fommater/formatCurrency";
const { ccclass, property } = _decorator;

interface ExternalSecretProps {
    encryptedData: string;
    iv: string;
    secretKey: string;
}

interface ExternalUser {
    username: string;
    password: string;
    expiredDate: string;
}

@ccclass("AccessScreen")
export class AccessPage extends Component {
    @property(Label)
    headerLabel: Label | null = null;

    @property(Button)
    startGameButton: Button | null = null;

    private encryptedData = "";
    private iv = "";
    private secretKey = "";

    onLoad() {
        // Lấy các query parameters từ URL
        const params = this.getQueryParams();
        this.encryptedData = params.encryptedData ?? "";
        this.iv = params.iv ?? "";
        this.secretKey = params.secretKey ?? "";

        if (this.headerLabel) {
            this.headerLabel.string = "Access from an external link";
        }

        if (this.startGameButton) {
            this.startGameButton.node.on("click", this.onStartGame, this);
        }
    }

    private getQueryParams(): Record<string, string> {
        const params: Record<string, string> = {};
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);

        urlParams.forEach((value, key) => {
            params[key] = value;
        });

        return params;
    }

    private async onStartGame() {
        try {
            if (!this.encryptedData || !this.iv || !this.secretKey) {
                console.error("Missing required parameters");
                return;
            }

            const secretData: ExternalSecretProps = {
                encryptedData: this.encryptedData,
                iv: this.iv,
                secretKey: this.secretKey,
            };

            // Gửi thông tin để kiểm tra secret
            const auth = await this.addMemberToSystem(secretData);
            if (!auth) {
                console.error("Authentication failed. Please check your secret data.");
                return;
            }

            const { username, password, expiredDate } = auth;

            console.info("[AUTH] Access external", {
                username,
                password,
                expiredDate,
            });

            // Kiểm tra thời gian hết hạn của liên kết
            const now = new Date().getTime();
            const _expiredDate = new Date(expiredDate).getTime();

            if (_expiredDate < now) {
                console.error("Your link has expired");
                return;
            }

            // Đăng nhập vào hệ thống
            await this.login(username, password);
         
           
        } catch (error) {
            console.error("Error during Start Game process:", error);
        }
    }

    private async addMemberToSystem(secret: ExternalSecretProps): Promise<ExternalUser | undefined> {
        try {
            // Lấy URL server từ cấu hình môi trường
            const serverURL = `${oops.http.server}/auth/secret-check`;

            // Tạo URL với các tham số
            const url = `${serverURL}?encryptedData=${encodeURIComponent(secret.encryptedData)}&iv=${encodeURIComponent(secret.iv)}&secretKey=${encodeURIComponent(secret.secretKey)}`;

            // Gửi request tới server
            const response = await fetch(url, { method: "GET" });

            // Kiểm tra trạng thái response
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            // Lấy dữ liệu trả về từ server
            const result = await response.json();

            return {
                username: result.username,
                password: result.password,
                expiredDate: result.expiredDate,
            };
        } catch (err) {
            console.error("Error in addMemberToSystem:", err);
            return undefined; // Trả về undefined nếu có lỗi
        }
    }


    async login(username: string, password: string) {
		try {
			oops.gui.waitOpen();
			const res = await fetch(`${oops.http.server}/auth/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ username, password }),
			});

			const data: HttpReturn = await res.json();
			if (data.status) {
				throw new Error(data.message);
			}

			VM.setValue("Account.data", data.user);
			VM.setValue("Account.balance", format(data.user.chipsAmount, true));
			oops.storage.set("userId", data.user.id);

			oops.gui.remove(UIID.AccessScreen, true);
			await oops.gui.openAsync(UIID.Layout);
			await oops.gui.openAsync(UIID.Home);
		} catch (error) {
			oops.gui.toast(`${error}`);
		} finally {
			oops.gui.waitClose();
		}
	}

    
}
