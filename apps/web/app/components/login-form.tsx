import { Button } from "@my-library-app/ui"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  FieldDescription,
  FieldGroup,
} from "@my-library-app/ui"
import { cn } from "@my-library-app/ui"
import { Github } from "@my-library-app/ui/icons"

import { useAuth } from "@/hooks/use-auth"

export function LoginForm() {
  const { login } = useAuth()

  const handleLogin = () => login({ provider: "github" })

  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Login with your Github account</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup>
              <Field>
                <Button variant="outline" type="button" onClick={handleLogin}>
                  <Github className="size-5" />
                  Continue with Github
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
