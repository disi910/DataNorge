"""initial schema: kommuner, organizations, data_centers, capacity_observations, sources, extraction_runs

Revision ID: 0001
Revises:
Create Date: 2026-04-24

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from geoalchemy2 import Geometry

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis")
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

    op.create_table(
        "kommuner",
        sa.Column("code", sa.Text, primary_key=True),
        sa.Column("name", sa.Text, nullable=False),
        sa.Column("fylke_code", sa.Text),
        sa.Column(
            "geometry",
            Geometry(geometry_type="MULTIPOLYGON", srid=4326, spatial_index=True),
        ),
        sa.Column("population", sa.Integer),
        sa.Column("total_electricity_gwh_year", sa.Numeric),
        sa.Column("electricity_year", sa.Integer),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "organizations",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("brreg_org_nr", sa.Text, unique=True, nullable=True),
        sa.Column("name", sa.Text, nullable=False),
        sa.Column("country", sa.Text, nullable=False, server_default="NO"),
        sa.Column("parent_org_id", sa.UUID(as_uuid=True), sa.ForeignKey("organizations.id"), nullable=True),
        sa.Column("nace_code", sa.Text, nullable=True),
        sa.Column("registered_address", sa.Text, nullable=True),
        sa.Column("raw_brreg_json", sa.JSON, nullable=True),
        sa.Column("first_seen", sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
        sa.Column("last_verified", sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_organizations_parent_org_id", "organizations", ["parent_org_id"])

    op.create_table(
        "sources",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("url", sa.Text, nullable=False),
        sa.Column("title", sa.Text),
        sa.Column("published_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("source_type", sa.Text, nullable=False),
        sa.Column("domain", sa.Text),
        sa.Column("snapshot_path", sa.Text, nullable=True),
        sa.Column("fetched_at", sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
        sa.Column("http_status", sa.Integer, nullable=True),
    )
    op.create_index("ix_sources_domain_fetched_at", "sources", ["domain", "fetched_at"])

    op.create_table(
        "data_centers",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("name", sa.Text, nullable=False),
        sa.Column("operator_org_id", sa.UUID(as_uuid=True), sa.ForeignKey("organizations.id"), nullable=True),
        sa.Column("owner_ultimate_org_id", sa.UUID(as_uuid=True), sa.ForeignKey("organizations.id"), nullable=True),
        sa.Column("kommune_code", sa.Text, sa.ForeignKey("kommuner.code"), nullable=True),
        sa.Column(
            "location",
            Geometry(geometry_type="POINT", srid=4326, spatial_index=True),
            nullable=True,
        ),
        sa.Column("address", sa.Text, nullable=True),
        sa.Column(
            "status",
            sa.Text,
            sa.CheckConstraint(
                "status IN ('planned','under_construction','operational','decommissioned')",
                name="ck_data_centers_status",
            ),
            nullable=False,
        ),
        sa.Column("site_type", sa.Text, nullable=True),
        sa.Column("first_seen", sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
        sa.Column("last_verified", sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
        sa.Column("notes", sa.Text, nullable=True),
        sa.UniqueConstraint("operator_org_id", "name", name="uq_data_centers_operator_name"),
    )

    op.create_table(
        "capacity_observations",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column(
            "data_center_id",
            sa.UUID(as_uuid=True),
            sa.ForeignKey("data_centers.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("mw_current", sa.Numeric, nullable=True),
        sa.Column("mw_planned_max", sa.Numeric, nullable=True),
        sa.Column("observed_at", sa.Date, nullable=False),
        sa.Column("source_id", sa.UUID(as_uuid=True), sa.ForeignKey("sources.id"), nullable=False),
        sa.Column(
            "confidence",
            sa.Numeric,
            sa.CheckConstraint("confidence BETWEEN 0 AND 1", name="ck_capacity_confidence"),
            nullable=False,
        ),
        sa.Column("extracted_by", sa.Text, nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_capacity_observations_dc_id", "capacity_observations", ["data_center_id"])

    op.create_table(
        "extraction_runs",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("source_id", sa.UUID(as_uuid=True), sa.ForeignKey("sources.id"), nullable=False),
        sa.Column("model", sa.Text, nullable=False),
        sa.Column("prompt_version", sa.Text, nullable=False),
        sa.Column("tokens_in", sa.Integer),
        sa.Column("tokens_out", sa.Integer),
        sa.Column("cost_usd", sa.Numeric),
        sa.Column("result_json", sa.JSON),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("extraction_runs")
    op.drop_table("capacity_observations")
    op.drop_table("data_centers")
    op.drop_table("sources")
    op.drop_table("organizations")
    op.drop_table("kommuner")
