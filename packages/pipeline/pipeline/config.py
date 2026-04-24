from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    postgres_user: str = "datasenter"
    postgres_password: str = "changeme"
    postgres_db: str = "datasenter"
    postgres_host: str = "localhost"
    postgres_port: int = 5432

    anthropic_api_key: str | None = None

    user_agent: str = "Datasenter-Norge/0.1 (contact: didrik2004@icloud.com)"

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+psycopg://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )


settings = Settings()
