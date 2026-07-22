using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Portfolio.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddRatingsAndVisitorUnlocks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Ratings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Value = table.Column<int>(type: "int", nullable: false),
                    VisitorId = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    FingerprintHash = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    CoarseFingerprintHash = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    IpHash = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ratings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "VisitorUnlocks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VisitorId = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    FingerprintHash = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    CoarseFingerprintHash = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    IpHash = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    UnlockedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VisitorUnlocks", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Ratings_CoarseFingerprintHash",
                table: "Ratings",
                column: "CoarseFingerprintHash");

            migrationBuilder.CreateIndex(
                name: "IX_Ratings_FingerprintHash",
                table: "Ratings",
                column: "FingerprintHash");

            migrationBuilder.CreateIndex(
                name: "IX_Ratings_IpHash",
                table: "Ratings",
                column: "IpHash");

            migrationBuilder.CreateIndex(
                name: "IX_Ratings_VisitorId",
                table: "Ratings",
                column: "VisitorId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_VisitorUnlocks_CoarseFingerprintHash",
                table: "VisitorUnlocks",
                column: "CoarseFingerprintHash");

            migrationBuilder.CreateIndex(
                name: "IX_VisitorUnlocks_FingerprintHash",
                table: "VisitorUnlocks",
                column: "FingerprintHash");

            migrationBuilder.CreateIndex(
                name: "IX_VisitorUnlocks_IpHash",
                table: "VisitorUnlocks",
                column: "IpHash");

            migrationBuilder.CreateIndex(
                name: "IX_VisitorUnlocks_VisitorId",
                table: "VisitorUnlocks",
                column: "VisitorId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Ratings");

            migrationBuilder.DropTable(
                name: "VisitorUnlocks");
        }
    }
}
